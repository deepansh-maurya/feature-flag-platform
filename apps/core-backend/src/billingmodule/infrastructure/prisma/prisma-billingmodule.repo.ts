import { Injectable } from '@nestjs/common';
import PrismaService from 'src/infra/prisma/prisma.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import {
    BillingmoduleRepo,
    PlanKey,
    BillingCycle,
    SubscriptionStatus,
    StartCheckoutDto,
    ChangePlanDto,
    CancelDto,
    ResumeDto,
    PortalDto,
    SubscriptionDto,
    EntitlementsDto,
    UpsertFromRazorpaySubscriptionDto,
    ReconciliationSubscriptionItemDto,
    CheckoutInitDto,
} from '../../application/ports/billingmodule.repo';

@Injectable()
export default class RazorpayBillingModuleRepo implements BillingmoduleRepo {
    private rzp: Razorpay;

    constructor(private readonly prisma: PrismaService) {
        this.rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });
    }

    // ---------------------------
    // Commands
    // ---------------------------
    async startCheckout(input: StartCheckoutDto): Promise<CheckoutInitDto> {
        const {
            workspaceId,
            planKey,
            cycle,
            prefillName,
            prefillEmail,
            prefillContact,
        } = input;

        const planId = await this.getRazorpayPlanId(planKey, cycle);

        // (Optional) attach/store customer id on workspace
        let customerId =
            input.razorpayCustomerId ??
            (await this.getRazorpayCustomerId(workspaceId));
        if (!customerId) {
            const cust = await this.rzp.customers.create({
                name: prefillName,
                email: prefillEmail,
                contact: prefillContact,
                notes: { workspaceId },
            });
            customerId = cust.id;
            await this.setRazorpayCustomerId(workspaceId, customerId);
        }

        // Create Subscription (NOT Order) — Checkout will be opened on FE with subscription_id
        const sub = await this.rzp.subscriptions.create({
            plan_id: planId,
            total_count: cycle === 'monthly' ? 12 : 1, // adjust policy as needed
            customer_notify: 1,
            notes: { workspaceId, planKey, cycle, customerId },
        });

        // Persist a pending row (optional; final state comes via webhook)
        await this.prisma.subscription
            .create({
                data: {
                    workspaceId,
                    planKey,
                    billingCycle: cycle,
                    status: 'trialing', // or 'active' after first charge; webhook is source of truth
                    periodStart: new Date(),
                    periodEnd: this.computeNextPeriodEnd(new Date(), cycle),
                    razorpayCustomerId: customerId,
                    razorpaySubId: sub.id,
                },
            })
            .catch(() => void 0); // if unique constraint, ignore; webhook will upsert

        // after creating the subscription
        const plan = await this.rzp.plans.fetch(planId); // has item.amount (paise) & item.currency
        const amountPaise = plan.item.amount;
        const currency = plan.item.currency;

        return {
            keyId: process.env.RAZORPAY_KEY_ID!,
            subscriptionId: sub.id,
            planKey,
            cycle,
            amount: Number(amountPaise),
            currency: currency as 'INR',
            notes: { workspaceId, planKey, cycle },
            prefill: {
                name: prefillName,
                email: prefillEmail,
                contact: prefillContact,
            },
        };
    }

    async changePlan(input: ChangePlanDto): Promise<void> {
        const { workspaceId, newPlanKey, cycle, immediate = true } = input;

        const current = await this.prisma.subscription.findFirst({
            where: {
                workspaceId,
                razorpaySubId: { not: null },
                status: { in: ['active', 'trialing', 'past_due', 'grace'] },
            },
            orderBy: { createdAt: 'desc' },
            select: { razorpaySubId: true },
        });
        if (!current?.razorpaySubId)
            throw new Error('No active Razorpay subscription to change');

        // 1) Cancel current subscription
        await this.rzp.subscriptions.cancel(
            current.razorpaySubId,
            immediate ? false : true, // false = cancel now, true = cancel at cycle end
        );

        // 2) Create new subscription right away (if immediate), else let current run to end and new will be bought later
        if (immediate) {
            const planId = await this.getRazorpayPlanId(newPlanKey, cycle);

            // retrieve customer id from DB
            const row = await this.prisma.subscription.findFirst({
                where: { razorpaySubId: current.razorpaySubId },
                select: { razorpayCustomerId: true, workspaceId: true },
            });
            const customerId =
                row?.razorpayCustomerId ??
                (await this.getRazorpayCustomerId(workspaceId));
            if (!customerId)
                throw new Error('Missing Razorpay customer for workspace');

            const newSub = await this.rzp.subscriptions.create({
                plan_id: planId,
                total_count: cycle === 'monthly' ? 12 : 1,
                customer_notify: 1,
                notes: { workspaceId, planKey: newPlanKey, cycle, customerId },
            });

            // optimistic insert; webhook will finalize
            await this.prisma.subscription
                .create({
                    data: {
                        workspaceId,
                        planKey: newPlanKey,
                        billingCycle: cycle,
                        status: 'active',
                        periodStart: new Date(),
                        periodEnd: this.computeNextPeriodEnd(new Date(), cycle),
                        razorpayCustomerId: customerId,
                        razorpaySubId: newSub.id,
                    },
                })
                .catch(() => void 0);
        }
    }

    async cancel(input: CancelDto): Promise<void> {
        const { workspaceId, atPeriodEnd } = input;
        const sub = await this.prisma.subscription.findFirst({
            where: {
                workspaceId,
                razorpaySubId: { not: null },
                status: { in: ['active', 'trialing', 'past_due', 'grace'] },
            },
            orderBy: { createdAt: 'desc' },
            select: { razorpaySubId: true },
        });
        if (!sub?.razorpaySubId)
            throw new Error('No active Razorpay subscription to cancel');

        await this.rzp.subscriptions.cancel(sub.razorpaySubId, atPeriodEnd ? true : false);
        // webhook `subscription.cancelled` will persist final state
    }

    async resume(input: ResumeDto): Promise<void> {
        // Razorpay doesn’t resume a canceled sub; create a fresh one
        await this.changePlan({
            workspaceId: input.workspaceId,
            newPlanKey: input.planKey,
            cycle: input.cycle,
            immediate: true,
        });
    }

    async createPortalSession(input: PortalDto): Promise<{ url: string }> {
        // Razorpay has no hosted billing portal; return your app’s page
        const url = `${process.env.APP_URL}/billing?ws=${encodeURIComponent(input.workspaceId)}`;
        return { url };
    }

    // ---------------------------
    // Queries
    // ---------------------------
    async getCurrentSubscription(
        workspaceId: string,
    ): Promise<SubscriptionDto | null> {
        const row = await this.prisma.subscription.findFirst({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
        });
        return row as any;
    }

    async getEntitlements(workspaceId: string): Promise<EntitlementsDto> {
        const sub = await this.getCurrentSubscription(workspaceId);
        const plan = (sub?.planKey ?? 'STARTER') as PlanKey;
        const status = (sub?.status ?? 'canceled') as SubscriptionStatus;

        const PLAN_LIMITS: Record<PlanKey, Record<string, number | boolean>> = {
            STARTER: { projects: 3, customDomain: false, aiTokens: 100_000 },
            GROWTH: { projects: 20, customDomain: true, aiTokens: 1_000_000 },
            ENTERPRISE: { projects: 999, customDomain: true, aiTokens: 99_999_999 },
        };

        const effectivePlan: PlanKey =
            status === 'canceled' || status === 'frozen' ? 'STARTER' : plan;

        const limits = PLAN_LIMITS[effectivePlan];
        const features: Record<string, boolean> = {
            customDomain: !!limits.customDomain,
        };

        return { workspaceId, effectivePlan, status, limits, features };
    }

    // ---------------------------
    // Webhook sync (Razorpay → DB)
    // ---------------------------
    async upsertFromRazorpaySubscription(
        payload: UpsertFromRazorpaySubscriptionDto,
    ): Promise<void> {
        const {
            razorpaySubId,
            razorpayCustomerId,
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
            where: { razorpaySubId },
            create: {
                workspaceId,
                planKey,
                billingCycle,
                status,
                periodStart,
                periodEnd,
                razorpayCustomerId,
                razorpaySubId,
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
                razorpayCustomerId,
                cancelAtPeriodEnd: !!cancelAtPeriodEnd,
                cancelsAt: cancelsAt ?? null,
            },
        });
    }

    async setStatusActiveByRazorpaySubId(razorpaySubId: string): Promise<void> {
        await this.prisma.subscription.updateMany({
            where: { razorpaySubId },
            data: { status: 'active' },
        });
    }

    async setStatusPastDueByRazorpaySubId(razorpaySubId: string): Promise<void> {
        await this.prisma.subscription.updateMany({
            where: { razorpaySubId },
            data: { status: 'past_due' },
        });
    }

    async setCanceledByRazorpaySubId(input: {
        razorpaySubId: string;
        periodEnd?: Date;
    }): Promise<void> {
        const { razorpaySubId, periodEnd } = input;
        await this.prisma.subscription.updateMany({
            where: { razorpaySubId },
            data: {
                status: 'canceled',
                periodEnd: periodEnd ?? new Date(),
                cancelAtPeriodEnd: false,
                cancelsAt: periodEnd ?? new Date(),
            },
        });
    }

    // ---------------------------
    // Idempotency / Reconciliation
    // ---------------------------
    async isWebhookEventProcessed(dedupeKey: string): Promise<boolean> {
        if (!dedupeKey) return false;
        const found = await this.prisma.webhookEvent
            .findUnique({ where: { id: dedupeKey }, select: { id: true } })
            .catch(() => null);
        return !!found;
    }

    async markWebhookEventProcessed(dedupeKey: string): Promise<void> {
        if (!dedupeKey) return;
        await this.prisma.webhookEvent
            .create({ data: { id: dedupeKey } })
            .catch((e: any) => {
                if (e?.code !== 'P2002') throw e; // swallow duplicates
            });
    }

    async listSubscriptionsForReconciliation(): Promise<
        Array<ReconciliationSubscriptionItemDto>
    > {
        const rows = await this.prisma.subscription.findMany({
            where: {
                status: { in: ['active', 'trialing', 'past_due', 'grace'] },
                razorpaySubId: { not: null },
            },
            select: { workspaceId: true, razorpaySubId: true },
        });
        return rows as any;
    }

    async patchSubscriptionByRazorpaySubId(
        patch: Partial<SubscriptionDto> & { razorpaySubId: string },
    ): Promise<void> {
        const { razorpaySubId, ...data } = patch;
        await this.prisma.subscription.updateMany({
            where: { razorpaySubId },
            data: data as any,
        });
    }

    // ---------------------------
    // Customer linkage
    // ---------------------------
    async getRazorpayCustomerId(workspaceId: string): Promise<string | null> {
        try {
            const ws = await this.prisma.workspace.findUnique({
                where: { id: workspaceId },
                select: { razorpayCustomerId: true },
            });
            return ws?.razorpayCustomerId ?? null;
        } catch {
            return null;
        }
    }

    async setRazorpayCustomerId(
        workspaceId: string,
        razorpayCustomerId: string,
    ): Promise<void> {
        try {
            await this.prisma.workspace.update({
                where: { id: workspaceId },
                data: { razorpayCustomerId },
            });
        } catch {
            /* ignore if no column; store elsewhere if needed */
        }
    }

    // ---------------------------
    // Mapping helpers
    // ---------------------------
    async getRazorpayPlanId(
        planKey: PlanKey,
        cycle: BillingCycle,
    ): Promise<string> {
        const key = `${planKey}:${cycle}`;
        const MAP: Record<string, string> = {
            'STARTER:monthly': process.env.RZP_PLAN_STARTER_M!,
            'STARTER:yearly': process.env.RZP_PLAN_STARTER_Y!,
            'GROWTH:monthly': process.env.RZP_PLAN_GROWTH_M!,
            'GROWTH:yearly': process.env.RZP_PLAN_GROWTH_Y!,
            'ENTERPRISE:monthly': process.env.RZP_PLAN_ENTERPRISE_M!,
            'ENTERPRISE:yearly': process.env.RZP_PLAN_ENTERPRISE_Y!,
        };
        const id = MAP[key];
        if (!id) throw new Error(`Unknown plan mapping for ${key}`);
        return id;
    }

    async mapRazorpayPlanId(
        planId: string,
    ): Promise<{ planKey: PlanKey; cycle: BillingCycle }> {
        const rev: Record<string, { planKey: PlanKey; cycle: BillingCycle }> = {
            [process.env.RZP_PLAN_STARTER_M!]: {
                planKey: 'STARTER',
                cycle: 'monthly',
            },
            [process.env.RZP_PLAN_STARTER_Y!]: {
                planKey: 'STARTER',
                cycle: 'yearly',
            },
            [process.env.RZP_PLAN_GROWTH_M!]: { planKey: 'GROWTH', cycle: 'monthly' },
            [process.env.RZP_PLAN_GROWTH_Y!]: { planKey: 'GROWTH', cycle: 'yearly' },
            [process.env.RZP_PLAN_ENTERPRISE_M!]: {
                planKey: 'ENTERPRISE',
                cycle: 'monthly',
            },
            [process.env.RZP_PLAN_ENTERPRISE_Y!]: {
                planKey: 'ENTERPRISE',
                cycle: 'yearly',
            },
        };
        const m = rev[planId];
        if (!m) throw new Error(`Unknown Razorpay plan id ${planId}`);
        return m;
    }

    // ---------------------------
    // Utilities
    // ---------------------------
    private computeNextPeriodEnd(start: Date, cycle: BillingCycle): Date {
        const d = new Date(start);
        if (cycle === 'monthly') d.setMonth(d.getMonth() + 1);
        else d.setFullYear(d.getFullYear() + 1);
        return d;
    }

    /** Map Razorpay subscription.status → your app status */
    public mapRazorpayStatus(s: string): SubscriptionStatus {
        switch (s) {
            case 'active':
                return 'active';
            case 'authenticated': // mandate created but not charged yet
            case 'pending':
                return 'trialing';
            case 'halted':
                return 'past_due';
            case 'completed':
                return 'canceled'; // finished term
            case 'cancelled':
                return 'canceled';
            default:
                return 'frozen';
        }
    }

    /** Build a stable dedupe key for Razorpay webhook (no event.id in payload) */
    public static makeWebhookDedupeKey(rawBody: string) {
        return crypto.createHash('sha256').update(rawBody).digest('hex');
    }
}
