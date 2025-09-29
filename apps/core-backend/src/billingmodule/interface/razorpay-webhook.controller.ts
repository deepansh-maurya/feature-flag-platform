import { Controller, Post, Req, Res, HttpCode, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import {
  BillingmoduleRepo,
  BillingmoduleRepoToken,
  PlanKey,
  BillingCycle,
  SubscriptionStatus,
  UpsertFromRazorpaySubscriptionDto,
} from '../application/ports/billingmodule.repo';

/**
 * IMPORTANT (main.ts):
 * app.use('/webhook/razorpay', express.raw({ type: 'application/json' }));
 * Do NOT use JSON body parser for this route — we need the raw bytes for HMAC.
 */

@Controller()
export class RazorpayWebhookController {
  constructor(
    @Inject(BillingmoduleRepoToken) private readonly repo: BillingmoduleRepo,
  ) {}

  @Post('/webhook/rzp')
  @HttpCode(200)
  async handle(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['x-razorpay-signature'] as string | undefined;
    if (!sig) return res.status(400).send('Missing x-razorpay-signature');

    console.log(sig, 31);

    // Razorpay requires HMAC-SHA256 over the *raw* body using your WEBHOOK SECRET (not key_secret).
    const rawBody =
      (req as any).rawBody instanceof Buffer
        ? (req as any).rawBody
        : Buffer.from(
            typeof (req as any).body === 'string'
              ? (req as any).body
              : JSON.stringify((req as any).body || {}),
          );

    console.log(rawBody, 44);

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest('hex');

    console.log(expected, 52);

    // timing-safe comparison
    const isValid =
      expected.length === sig.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
    if (!isValid) {
      return res.status(400).send('Webhook signature verification failed');
    }

    console.log(isValid);

    // Razorpay doesn't include event.id; dedupe on a hash of the raw body
    const dedupeKey = crypto.createHash('sha256').update(rawBody).digest('hex');
    if (await this.repo.isWebhookEventProcessed(dedupeKey)) {
      return res.send(); // already handled
    }

    console.log(dedupeKey, 68);

    try {
      const body: any = JSON.parse(rawBody.toString('utf8'));
      const event = body?.event as string | undefined;
      console.log(body, event);

      switch (event) {
        // -------- SUBSCRIPTION LIFE CYCLE --------
        case 'subscription.activated':
        case 'subscription.charged':
        case 'subscription.pending':
        case 'subscription.halted':
        case 'subscription.completed':
        case 'subscription.paused':
        case 'subscription.resumed':
        case 'subscription.cancelled': {
          const sub = body?.payload?.subscription?.entity;
          if (!sub?.id) break;

          console.log(sub, 88);

          const dto = await this.mapRazorpaySubscriptionToDto(sub);
          await this.repo.upsertFromRazorpaySubscription(dto);

          console.log(dto, 94);

          // Extra guards for “canceled now”
          if (
            event === 'subscription.cancelled' ||
            sub.status === 'cancelled'
          ) {
            await this.repo.setCanceledByRazorpaySubId({
              razorpaySubId: sub.id,
              periodEnd: this.extractPeriodEnd(sub, dto.billingCycle),
            });
          }
          break;
        }

        // -------- PAYMENTS (initial or recurring) --------
        case 'payment.captured': {
          // You may link payment → subscription via notes or order/mandate refs
          // If you can resolve a subscription id from this payload, mark active:
          const subId = this.tryGetSubIdFromPayment(body);
          if (subId) await this.repo.setStatusActiveByRazorpaySubId(subId);

          console.log(subId);

          break;
        }

        case 'payment.failed': {
          const subId = this.tryGetSubIdFromPayment(body);
          if (subId) await this.repo.setStatusPastDueByRazorpaySubId(subId);
          break;
        }

        default:
          // Unhandled events can be logged for observability
          // console.log('Unhandled Razorpay event:', event);
          break;
      }

      await this.repo.markWebhookEventProcessed(dedupeKey);
      return res.send(); // 200 OK
    } catch (err) {
      console.error('Razorpay webhook handling failed:', err);
      // Return 5xx so Razorpay retries
      return res.status(500).send('Webhook handling failed');
    }
  }

  // ----------------- Helpers -----------------

  /**
   * Map Razorpay subscription payload → your Upsert DTO
   * Expected fields commonly present on Razorpay sub:
   *  - id, status, plan_id, customer_id, current_start, current_end, start_at
   *  - notes: { workspaceId, planKey?, cycle? } (we set these when creating)
   */
  private async mapRazorpaySubscriptionToDto(
    sub: any,
  ): Promise<UpsertFromRazorpaySubscriptionDto> {
    const razorpaySubId = sub.id as string;
    const razorpayCustomerId = (sub.customer_id as string) ?? null;

    // Resolve workspaceId: prefer notes set when you created the subscription
    const workspaceId =
      sub?.notes?.workspaceId ??
      sub?.customer_notes?.workspaceId ?? // if you ever store on customer
      null;

    if (!workspaceId) {
      throw new Error(
        `Cannot resolve workspaceId for subscription ${razorpaySubId}`,
      );
    }

    // Map plan id -> (planKey, cycle)
    const planId = sub?.plan_id as string | undefined;
    if (!planId)
      throw new Error(`Subscription ${razorpaySubId} has no plan_id`);

    const { planKey, cycle } = await this.repo.mapRazorpayPlanId(planId);

    // Periods
    const periodStart = this.extractPeriodStart(sub);
    const periodEnd = this.extractPeriodEnd(sub, cycle);

    // Status mapping
    const status = this.mapRazorpayStatus(sub?.status as string);

    // Scheduled cancel flags (Razorpay doesn't expose cancel_at_period_end like Stripe)
    const cancelAtPeriodEnd = false;
    const cancelsAt: Date | null = null;

    return {
      razorpaySubId,
      razorpayCustomerId,
      workspaceId,
      planKey: planKey,
      billingCycle: cycle,
      status,
      periodStart,
      periodEnd,
      cancelAtPeriodEnd,
      cancelsAt,
    };
  }

  /** Convert Razorpay status → your app status */
  private mapRazorpayStatus(s: string): SubscriptionStatus {
    // Razorpay statuses: created | authenticated | active | pending | halted | completed | paused | cancelled
    switch (s) {
      case 'active':
        return 'active';
      case 'authenticated':
        return 'trialing'; // mandate authorized but not charged
      case 'pending':
        return 'trialing';
      case 'halted':
        return 'past_due';
      case 'completed':
        return 'canceled';
      case 'paused':
        return 'frozen';
      case 'cancelled':
        return 'canceled';
      default:
        return 'frozen';
    }
  }

  /** Period start: prefer current_start, fallback to start_at, else now */
  private extractPeriodStart(sub: any): Date {
    const start =
      (typeof sub.current_start === 'number' && sub.current_start) ||
      (typeof sub.start_at === 'number' && sub.start_at) ||
      Math.floor(Date.now() / 1000);
    return new Date(start * 1000);
  }

  /** Period end: prefer current_end; else compute next end from cycle */
  private extractPeriodEnd(sub: any, cycle: BillingCycle): Date {
    if (typeof sub.current_end === 'number' && sub.current_end) {
      return new Date(sub.current_end * 1000);
    }
    // Fallback: compute 1 month/year from periodStart if Razorpay didn't include
    const start = this.extractPeriodStart(sub);
    const d = new Date(start);
    if (cycle === 'monthly') d.setMonth(d.getMonth() + 1);
    else d.setFullYear(d.getFullYear() + 1);
    return d;
  }

  /**
   * Try to resolve a subscription id from a payment event:
   * - Sometimes present in payment.notes.subscription_id (if you set when creating)
   * - Or payment.invoice_id -> fetch invoice links in your infra if needed (optional)
   */
  private tryGetSubIdFromPayment(body: any): string | null {
    const payment = body?.payload?.payment?.entity;
    if (!payment) return null;
    const fromNotes =
      payment?.notes?.subscription_id ||
      payment?.notes?.razorpay_subscription_id;
    if (typeof fromNotes === 'string') return fromNotes;
    return null;
  }
}
