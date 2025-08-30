// src/billingmodule/interface/http/stripe-webhook.controller.ts
import {
    Controller, Post, Req, Res, HttpCode, Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import {  BillingmoduleRepo, BillingmoduleRepoToken } from '../application/ports/billingmodule.repo';
import { BillingCycle, PlanKey } from 'generated/prisma';

@Controller()
export class StripeWebhookController {
    private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-07-30" as any});

    constructor(
        @Inject(BillingmoduleRepoToken) private readonly repo: BillingmoduleRepo,
    ) { }

    @Post('/webhook/stripe')
    @HttpCode(200)
    async handle(@Req() req: Request, @Res() res: Response) {
        const sig = req.headers['stripe-signature'] as string | undefined;
        if (!sig) return res.status(400).send('Missing stripe-signature');

        let event: Stripe.Event;
        try {
            event = this.stripe.webhooks.constructEvent(
                (req as any).rawBody ?? (req as any).body, // raw body from main.ts
                sig,
                process.env.STRIPE_WEBHOOK_SECRET!,
            );
        } catch (err) {
            return res.status(400).send(`Webhook signature verification failed: ${(err as Error).message}`);
        }

        // Idempotency: skip if seen
        if (await this.repo.isWebhookEventProcessed(event.id)) {
            return res.send(); // 200 OK
        }

        try {
            switch (event.type) {
                // ——— SUBSCRIPTION LIFECYCLE ———
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted': {
                    const sub = event.data.object as Stripe.Subscription;   
                    const dto = await this.mapStripeSubscriptionToDto(sub);
                    await this.repo.upsertFromStripeSubscription(dto as any);

                    // If Stripe actually canceled the sub immediately, guard with a local cancel
                    if (event.type === 'customer.subscription.deleted' || sub.status === 'canceled') {
                        await this.repo.setCanceledByStripeSubId({
                            stripeSubId: sub.id,
                            periodEnd: sub.ended_at ? new Date(sub.ended_at * 1000) : undefined,
                        });
                    }
                    break;
                }

                case 'invoice.paid': {
                    const inv = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription };

                    const subId =
                        typeof inv.subscription === 'string'
                            ? inv.subscription
                            : inv.subscription?.id;

                    if (subId) {
                        await this.repo.setStatusActiveByStripeSubId(subId);
                    }
                    break;
                }


                case 'invoice.payment_failed': {
                    const inv = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription };
                    const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id;
                    if (subId) await this.repo.setStatusPastDueByStripeSubId(subId);
                    break;
                }

                // Optional but often helpful to catch 3DS/dunning flows:
                case 'customer.subscription.trial_will_end':
                case 'invoice.upcoming':
                case 'checkout.session.completed':
                default:
                    // Ignore or add logging for observability
                    break;
            }

            await this.repo.markWebhookEventProcessed(event.id);
            return res.send(); // 200 OK
        } catch (err) {
            // Let Stripe retry by returning 5xx on failures
            console.error('Webhook handling failed:', err);
            return res.status(500).send('Webhook handling failed');
        }
    }

    // ---------- Helpers ----------

    /** Translate Stripe.Subscription → UpsertFromStripeSubscriptionDto */
    private async mapStripeSubscriptionToDto(s: Stripe.Subscription) {
        const stripeSubId = s.id;
        const stripeCustomerId = typeof s.customer === 'string' ? s.customer : s.customer.id;

        // Resolve workspaceId:
        // Prefer customer.metadata.workspaceId; if absent, try subscription metadata, else fetch customer
        let workspaceId: string | undefined;
        if (typeof s.customer !== 'string' && (s.customer as Stripe.Customer).metadata?.workspaceId) {
            workspaceId = (s.customer as Stripe.Customer).metadata.workspaceId;
        }
        else if ((s.metadata as any)?.workspaceId) {
            workspaceId = (s.metadata as any).workspaceId;
        }
        else if (typeof s.customer === 'string') {
            const cust = await this.stripe.customers.retrieve(stripeCustomerId);
            if (!cust.deleted && (cust as Stripe.Customer).metadata?.workspaceId) {
                workspaceId = (cust as Stripe.Customer).metadata.workspaceId;
            }
        }

        if (!workspaceId) {
            throw new Error(`Cannot resolve workspaceId for subscription ${stripeSubId}`);
        }

        // Map price → (planKey, cycle)
        const price = s.items.data[0]?.price;
        if (!price?.id) {
            throw new Error(`Subscription ${stripeSubId} has no price`);
        }
        const { planKey, cycle } = await this.repo.mapPriceId(price.id);

        // Periods & status
        const periodStart = new Date(((s as any).current_period_start ?? 0) * 1000);
        const periodEnd = new Date(((s as any).current_period_end ?? 0) * 1000);

        // Local status mapping: mirror Stripe, keep your enums
        const status = this.mapStripeStatus(s.status);

        return {
            stripeSubId,    
            stripeCustomerId,
            workspaceId,
            planKey: planKey as PlanKey,
            billingCycle: cycle as BillingCycle,
            status,
            periodStart,
            periodEnd,
            cancelAtPeriodEnd: !!s.cancel_at_period_end,
            cancelsAt: s.cancel_at ? new Date(s.cancel_at * 1000) : null,
        };
    }

    private mapStripeStatus(s: Stripe.Subscription.Status) {
        // Your app enums: 'active' | 'trialing' | 'past_due' | 'grace' | 'frozen' | 'canceled'
        switch (s) {
            case 'active': return 'active';
            case 'trialing': return 'trialing';
            case 'past_due': return 'past_due';
            case 'unpaid': return 'frozen';     // choose: map unpaid → frozen
            case 'canceled': return 'canceled';
            case 'incomplete':
            case 'incomplete_expired':
            default: return 'frozen';           // treat unknown/bad states as frozen
        }
    }
}
