import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import Stripe from 'stripe';
import PrismaService from 'src/infra/prisma/prisma.service';
import { BillingmoduleRepo } from 'src/billingmodule/application/ports/billingmodule.repo';
import {
    CancelDto,
    ChangePlanDto,
    EntitlementsDto,
    PortalDto,
    ReconciliationSubscriptionItemDto,
    ResumeDto,
    StartCheckout,
    StartCheckoutDto,
    SubscriptionDto,
    UpsertFromStripeSubscriptionDto,
    VerifyHandlerDto,
} from 'src/billingmodule/interface/dto/create-billingmodule.dto';
import { BillingCycle, PlanKey, SubscriptionStatus } from 'generated/prisma';
import Razorpay from 'razorpay';

@Injectable()
export default class PrismaBillingModuleRepo implements BillingmoduleRepo {
    constructor(private readonly prisma: PrismaService) { }

    // Stripe SDK (server-side key only)
    private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-07-30.basil',
    });

    private razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // ---- Price catalog (env-driven; swap to DB table if you prefer) ----
    // Make sure these env vars exist in your .env
    // PRICE_STARTER_M, PRICE_STARTER_Y, PRICE_GROWTH_M, PRICE_GROWTH_Y, PRICE_ENTERPRISE_M, PRICE_ENTERPRISE_Y
    private PRICE_ID: Record<PlanKey, Record<BillingCycle, string>> = {
        STARTER: {
            monthly: process.env.PRICE_STARTER_M!,
            yearly: process.env.PRICE_STARTER_Y!,
        },
        GROWTH: {
            monthly: process.env.PRICE_GROWTH_M!,
            yearly: process.env.PRICE_GROWTH_Y!,
        },
        ENTERPRISE: {
            monthly: process.env.PRICE_ENTERPRISE_M!,
            yearly: process.env.PRICE_ENTERPRISE_Y!,
        },
        DEFAULT: {
            monthly: process.env.PRICE_DFAULT!,
            yearly: process.env.PRICE_DFAULT!,
        },
    };


    async startCheckout(input: StartCheckoutDto): Promise<StartCheckout> {
        const {
            amountInINR,
            purpose,
            metadata,
            currency = 'INR',
            receipt,
            notes,
            workspaceId,
        } = input;

        const order = await this.prisma.order.create({
            data: {
                workspaceId,
                currency,
                amount: Math.round(amountInINR * 100),
                purpose,
                metadata: metadata as any,
            },
        });

        const options = {
            amount: Math.round(amountInINR * 100),
            currency,
            receipt: receipt ?? `rcpt_${Date.now()}`,
            ...(typeof notes === 'object' ? notes : {}),
        };

        const rzpOrder = await this.razorpay.orders.create(options);

        await this.prisma.order.update({
            where: { id: order.id },
            data: { razorpayOrderId: rzpOrder.id },
        });

        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID!,
            internalOrderId: order.id,
        };
    }

    async verifyHandler(input: VerifyHandlerDto): Promise<boolean> {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, internalOrderId } = input

        const hmac = crypto.createHmac('sha256', process.env.RZP_KEY_SECRET!);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const expected = hmac.digest('hex');
        const ok = expected === razorpay_signature;

        await this.prisma.order.update({
            where: { id: internalOrderId },
            data: {
                razorpayPaymentId: razorpay_payment_id ?? null,
                razorpaySignature: razorpay_signature ?? null,
                // don't mark paid here; rely on webhook for source of truth
                metadata: { ...(input.metadata as any ?? {}), clientVerified: ok },
            },
        });

        return ok
    }

    // ---- Helpers: price map / customer linkage ------------------------

    private getPriceId(planKey: PlanKey, cycle: BillingCycle): string {
        const priceId = this.PRICE_ID[planKey]?.[cycle];
        if (!priceId) {
            throw new Error(`No price configured for plan=${planKey} cycle=${cycle}`);
        }
        return priceId;
    }

    /**
     * Get or create a Stripe Customer linked to this workspace.
     * Prefers Workspace.stripeCustomerId if you store it there.
     * Fallback: try latest Subscription row’s stripeCustomerId for this workspace.
     */
    private async ensureStripeCustomerForWorkspace(
        workspaceId: string,
    ): Promise<string> {
        // If you have stripeCustomerId on Workspace, use that:
        const ws = await this.prisma.workspace
            .findUnique({
                where: { id: workspaceId },
                select: { stripeCustomerId: true },
            })
            .catch(() => null as any);

        if (ws?.stripeCustomerId) return ws.stripeCustomerId;

        // Fallback: read from latest subscription (if exists)
        const lastSub = await this.prisma.subscription.findFirst({
            where: { workspaceId, stripeCustomerId: { not: null } },
            orderBy: { createdAt: 'desc' },
            select: { stripeCustomerId: true },
        });
        if (lastSub?.stripeCustomerId) {
            // Optionally, copy it back to workspace for faster future lookups
            await this.safeSetWorkspaceStripeCustomerId(
                workspaceId,
                lastSub.stripeCustomerId,
            );
            return lastSub.stripeCustomerId;
        }

        // Create a new Stripe customer and persist linkage
        const customer = await this.stripe.customers.create({
            metadata: { workspaceId },
        });

        await this.safeSetWorkspaceStripeCustomerId(workspaceId, customer.id);
        return customer.id;
    }

    /** Write back the customer id onto workspace if that column exists */
    private async safeSetWorkspaceStripeCustomerId(
        workspaceId: string,
        stripeCustomerId: string,
    ) {
        try {
            await this.prisma.workspace.update({
                where: { id: workspaceId },
                data: { stripeCustomerId },
            });
        } catch {
            // If your Workspace model doesn’t have stripeCustomerId, ignore or store in another table.
        }
    }

    // -------------------------------------------------------------------
    // The remaining interface methods will be implemented next…
    // (changePlan, cancel, resume, createPortalSession, queries, webhooks, etc.)
    // -------------------------------------------------------------------

    // stubs to satisfy interface for now; we’ll fill them in later
    async changePlan(input: ChangePlanDto): Promise<void> {
        const {
            workspaceId,
            newPlanKey,
            cycle,
            proration = 'create_prorations',
        } = input;

        // load current sub (needs stripeSubId)
        const sub = await this.prisma.subscription.findFirst({
            where: {
                workspaceId,
                stripeSubId: { not: null },
                status: { in: ['active', 'trialing', 'past_due', 'grace'] },
            },
            orderBy: { createdAt: 'desc' },
            select: { stripeSubId: true },
        });
        if (!sub?.stripeSubId)
            throw new Error('No existing Stripe subscription for this workspace');

        const live = await this.stripe.subscriptions.retrieve(sub.stripeSubId, {
            expand: ['items.data.price'],
        });
        const currentItem = live.items.data[0];
        if (!currentItem) throw new Error('Subscription has no items');

        // pick new price id
        const priceId = this.getPriceId(
            newPlanKey as PlanKey,
            cycle as BillingCycle,
        );

        await this.stripe.subscriptions.update(live.id, {
            items: [{ id: currentItem.id, price: priceId }],
            proration_behavior: proration,
            // NOTE: do NOT set billing_cycle_anchor here → keeps renewal date (anchor)
        });
        // DB will update via webhook customer.subscription.updated
        //? doubts in prorartion
    }

    async cancel(input: CancelDto): Promise<void> {
        const { workspaceId, atPeriodEnd } = input;

        const sub = await this.prisma.subscription.findFirst({
            where: {
                workspaceId,
                stripeSubId: { not: null },
                status: { in: ['active', 'trialing', 'past_due', 'grace'] },
            },
            orderBy: { createdAt: 'desc' },
            select: { stripeSubId: true },
        });
        if (!sub?.stripeSubId)
            throw new Error('No active Stripe subscription to cancel');

        if (atPeriodEnd) {
            await this.stripe.subscriptions.update(sub.stripeSubId, {
                cancel_at_period_end: true,
            });
        } else {
            await this.stripe.subscriptions.cancel(sub.stripeSubId);
        }
        // DB updates via webhook (updated/deleted)
    }

    async resume(input: ResumeDto): Promise<void> {
        const { workspaceId } = input;

        const sub = await this.prisma.subscription.findFirst({
            where: { workspaceId, stripeSubId: { not: null } },
            orderBy: { createdAt: 'desc' },
            select: { stripeSubId: true },
        });
        if (!sub?.stripeSubId)
            throw new Error('No Stripe subscription for this workspace');

        await this.stripe.subscriptions.update(sub.stripeSubId, {
            cancel_at_period_end: false,
        });
        // DB updates via webhook
    }

    async createPortalSession(input: PortalDto): Promise<{ url: string }> {
        const { workspaceId, returnUrl } = input;
        const customerId = await this.ensureStripeCustomerForWorkspace(workspaceId);

        const session = await this.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url:
                returnUrl ??
                `${process.env.APP_URL}/billing/portal-return?ws=${workspaceId}`,
        });

        if (!session.url) throw new Error('Stripe did not return a portal URL');
        return { url: session.url };
    }

    async getCurrentSubscription(
        workspaceId: string,
    ): Promise<SubscriptionDto | null> {
        const row = await this.prisma.subscription.findFirst({
            where: { workspaceId },
            orderBy: [{ createdAt: 'desc' }],
        });
        return row as any; // or map to DTO if needed
    }

    async getEntitlements(workspaceId: string): Promise<EntitlementsDto> {
        const sub = await this.getCurrentSubscription(workspaceId);

        // defaults for free if no sub
        const plan = sub?.planKey ?? ('STARTER' as PlanKey);
        const status = (sub?.status ?? 'canceled') as SubscriptionStatus;

        // example plan config (tweak to your product)
        const PLAN_LIMITS: Record<PlanKey, Record<string, number | boolean>> = {
            STARTER: { projects: 3, customDomain: false, aiTokens: 100_000 },
            GROWTH: { projects: 20, customDomain: true, aiTokens: 1_000_000 },
            ENTERPRISE: { projects: 999, customDomain: true, aiTokens: 99_999_999 },
            DEFAULT: {},
        };

        // simple status-based downgrade sample:
        const effectivePlan: PlanKey =
            status === 'canceled' || status === 'frozen' ? 'STARTER' : plan;

        const limits = PLAN_LIMITS[effectivePlan];
        const features: Record<string, boolean> = {
            customDomain: !!limits.customDomain,
        };

        return {
            workspaceId,
            effectivePlan,
            status,
            limits,
            features,
        } as EntitlementsDto;
    }

    async upsertFromStripeSubscription(
        payload: UpsertFromStripeSubscriptionDto,
    ): Promise<void> {
        const {
            stripeSubId,
            stripeCustomerId,
            workspaceId,
            planKey,
            billingCycle,
            status,
            periodStart,
            periodEnd,
            cancelAtPeriodEnd,
            cancelsAt,
        } = payload;

        await this.prisma.subscription.upsert({
            where: { stripeSubId },
            create: {
                workspaceId,
                planKey,
                billingCycle,
                status,
                periodStart,
                periodEnd,
                stripeCustomerId,
                stripeSubId,
                cancelAtPeriodEnd: !!cancelAtPeriodEnd,
                cancelsAt: cancelsAt ?? null,
            },
            update: {
                workspaceId,
                planKey,
                billingCycle,
                status,
                periodStart,
                periodEnd,
                stripeCustomerId,
                cancelAtPeriodEnd: !!cancelAtPeriodEnd,
                cancelsAt: cancelsAt ?? null,
            },
        });
    }

    async setStatusActiveByStripeSubId(stripeSubId: string): Promise<void> {
        await this.prisma.subscription.updateMany({
            where: { stripeSubId },
            data: { status: 'active' },
        });
    }

    async setStatusPastDueByStripeSubId(stripeSubId: string): Promise<void> {
        await this.prisma.subscription.updateMany({
            where: { stripeSubId },
            data: { status: 'past_due' },
        });
    }

    async setCanceledByStripeSubId(input: {
        stripeSubId: string;
        periodEnd?: Date;
    }): Promise<void> {
        const { stripeSubId, periodEnd } = input;
        await this.prisma.subscription.updateMany({
            where: { stripeSubId },
            data: {
                status: 'canceled',
                periodEnd: periodEnd ?? new Date(),
                cancelAtPeriodEnd: false,
                cancelsAt: periodEnd ?? new Date(),
            },
        });
    }

    /**
     * Return true if this Stripe event.id was already processed (for dedupe)
     */
    async isWebhookEventProcessed(eventId: string): Promise<boolean> {
        // Defensive: empty/undefined ids are treated as "not processed"
        if (!eventId) return false;

        try {
            const found = await this.prisma.webhookEvent.findUnique({
                where: { id: eventId },
                select: { id: true },
            });
            return !!found;
        } catch (err) {
            // If the table doesn't exist (e.g., migration not applied),
            // fail closed by treating as not processed so you still handle the event.
            // Optionally log this so you don’t miss creating the table.
            console.warn('isWebhookEventProcessed failed (check migrations):', err);
            return false;
        }
    }

    /**
     * Persist that a Stripe event.id has been processed (pair to the check above)
     */
    async markWebhookEventProcessed(eventId: string): Promise<void> {
        if (!eventId) return;

        try {
            await this.prisma.webhookEvent.create({
                data: { id: eventId },
            });
        } catch (err: any) {
            // If called twice for the same event, unique PK on id will throw — that’s fine.
            // Swallow "already exists" errors to keep idempotent behavior.
            const isUniqueViolation =
                typeof err?.code === 'string' &&
                (err.code === 'P2002' || err.code === 'P2003'); // Prisma unique/constraint codes
            if (!isUniqueViolation) {
                throw err;
            }
        }
    }

    async listSubscriptionsForReconciliation(): Promise<
        ReconciliationSubscriptionItemDto[]
    > {
        const rows = await this.prisma.subscription.findMany({
            where: { status: { in: ['active', 'trialing', 'past_due', 'grace'] } },
            select: { workspaceId: true, stripeSubId: true },
        });
        return rows.filter((r) => !!r.stripeSubId) as any;
    }

    async patchSubscriptionByStripeSubId(
        patch: Partial<SubscriptionDto> & { stripeSubId: string },
    ): Promise<void> {
        const { stripeSubId, ...data } = patch;
        await this.prisma.subscription.updateMany({
            where: { stripeSubId },
            data: data as any,
        });
    }

    async getStripeCustomerId(workspaceId: string): Promise<string | null> {
        try {
            const ws = await this.prisma.workspace.findUnique({
                where: { id: workspaceId },
                select: { stripeCustomerId: true },
            });
            return ws?.stripeCustomerId ?? null;
        } catch {
            return null;
        }
    }

    async setStripeCustomerId(
        workspaceId: string,
        stripeCustomerId: string,
    ): Promise<void> {
        try {
            await this.prisma.workspace.update({
                where: { id: workspaceId },
                data: { stripeCustomerId },
            });
        } catch {
            // if you don't store it on workspace, ignore or store elsewhere
        }
    }

    async mapPriceId(
        priceId: string,
    ): Promise<{ planKey: PlanKey; cycle: BillingCycle }> {
        // Example mapping (replace with your real Stripe price IDs)
        const map: Record<string, { planKey: PlanKey; cycle: BillingCycle }> = {
            price_123MONTHLY_STARTER: { planKey: 'STARTER', cycle: 'monthly' },
            price_456YEARLY_STARTER: { planKey: 'STARTER', cycle: 'yearly' },
            price_789MONTHLY_GROWTH: { planKey: 'GROWTH', cycle: 'monthly' },
            price_abcYEARLY_GROWTH: { planKey: 'GROWTH', cycle: 'yearly' },
            price_defMONTHLY_ENTER: { planKey: 'ENTERPRISE', cycle: 'monthly' },
            price_ghiYEARLY_ENTER: { planKey: 'ENTERPRISE', cycle: 'yearly' },
        };

        const found = map[priceId];
        if (!found) {
            throw new Error(`Unknown Stripe price id: ${priceId}`);
        }
        return found;
    }
}
