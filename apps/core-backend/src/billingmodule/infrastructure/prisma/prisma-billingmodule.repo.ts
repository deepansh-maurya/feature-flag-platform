import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import PrismaService from 'src/infra/prisma/prisma.service';
import {
    BillingmoduleRepo,
    BillingCycle,
    PlanKey,
} from 'src/billingmodule/application/ports/billingmodule.repo';
import {
    StartCheckoutDto,
} from 'src/billingmodule/interface/dto/create-billingmodule.dto';

@Injectable()
export default class PrismaBillingModuleRepo implements BillingmoduleRepo {
    constructor(private readonly prisma: PrismaService) { }

    // Stripe SDK (server-side key only)
    private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2025-07-30.basil",
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
    };

    // ---- Commands ------------------------------------------------------

    /** Create Stripe Checkout Session URL for buying a subscription */
    async startCheckout(input: StartCheckoutDto): Promise<{ url: string }> {
        const { workspaceId, planKey, cycle } = input;

        // 1) Ensure we have a Stripe customer for this workspace
        const customerId = await this.ensureStripeCustomerForWorkspace(workspaceId);

        // 2) Resolve the correct Price ID for (planKey, cycle)
        const priceId = this.getPriceId(planKey as PlanKey, cycle as BillingCycle);

        // 3) Create Checkout Session (idempotent)
        const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
        const idempotencyKey = `checkout:${workspaceId}:${planKey}:${cycle}`;

        const session = await this.stripe.checkout.sessions.create(
            {
                mode: 'subscription',
                customer: customerId,
                line_items: [{ price: priceId, quantity: 1 }],
                allow_promotion_codes: true,
                success_url: `${appUrl}/billing/success?ws=${encodeURIComponent(workspaceId)}`,
                cancel_url: `${appUrl}/billing/cancel?ws=${encodeURIComponent(workspaceId)}`,
                metadata: {
                    workspaceId,
                    planKey,
                    billingCycle: cycle,
                },
            },
            { idempotencyKey }
        );

        if (!session.url) {
            throw new Error('Stripe did not return a checkout session URL');
        }
        return { url: session.url };
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
    private async ensureStripeCustomerForWorkspace(workspaceId: string): Promise<string> {
        // If you have stripeCustomerId on Workspace, use that:
        const ws = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { stripeCustomerId: true },
        }).catch(() => null as any);

        if (ws?.stripeCustomerId) return ws.stripeCustomerId;

        // Fallback: read from latest subscription (if exists)
        const lastSub = await this.prisma.subscription.findFirst({
            where: { workspaceId, stripeCustomerId: { not: null } },
            orderBy: { createdAt: 'desc' },
            select: { stripeCustomerId: true },
        });
        if (lastSub?.stripeCustomerId) {
            // Optionally, copy it back to workspace for faster future lookups
            await this.safeSetWorkspaceStripeCustomerId(workspaceId, lastSub.stripeCustomerId);
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
    private async safeSetWorkspaceStripeCustomerId(workspaceId: string, stripeCustomerId: string) {
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
    async changePlan(): Promise<void> { throw new Error('Not implemented'); }
    async cancel(): Promise<void> { throw new Error('Not implemented'); }
    async resume(): Promise<void> { throw new Error('Not implemented'); }
    async createPortalSession(): Promise<{ url: string }> { throw new Error('Not implemented'); }

    async getCurrentSubscription(): Promise<any> { throw new Error('Not implemented'); }
    async getEntitlements(): Promise<any> { throw new Error('Not implemented'); }

    async upsertFromStripeSubscription(): Promise<void> { throw new Error('Not implemented'); }
    async setStatusActiveByStripeSubId(): Promise<void> { throw new Error('Not implemented'); }
    async setStatusPastDueByStripeSubId(): Promise<void> { throw new Error('Not implemented'); }
    async setCanceledByStripeSubId(): Promise<void> { throw new Error('Not implemented'); }


    /**
     * Return true if this Stripe event.id was already processed (for dedupe)
     */
    async isWebhookEventProcessed(eventId: string): Promise<boolean> {
        // Defensive: empty/undefined ids are treated as "not processed"
        if (!eventId) return false;

        try {
            const found = await this.prisma.webhookEvent.findUnique({
                where: { id: eventId }, //Todo insert the workspace id
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
    async markWebhookEventProcessed(eventId: string, workspaceId: string): Promise<void> {
        if (!eventId) return;

        try {
            await this.prisma.webhookEvent.create({
                data: { id: eventId, workspaceId: workspaceId },    //Todo insert the workspace id
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

    async listSubscriptionsForReconciliation(): Promise<any[]> { throw new Error('Not implemented'); }
    async patchSubscriptionByStripeSubId(): Promise<void> { throw new Error('Not implemented'); }

    async getStripeCustomerId(): Promise<string | null> { throw new Error('Not implemented'); }
    async setStripeCustomerId(): Promise<void> { throw new Error('Not implemented'); }

    async mapPriceId(priceId: string): Promise<{ planKey: PlanKey; cycle: BillingCycle }> {
        // Example mapping (replace with your real Stripe price IDs)
        const map: Record<string, { planKey: PlanKey; cycle: BillingCycle }> = {
            "price_123MONTHLY_STARTER": { planKey: "STARTER", cycle: "monthly" },
            "price_456YEARLY_STARTER": { planKey: "STARTER", cycle: "yearly" },
            "price_789MONTHLY_GROWTH": { planKey: "GROWTH", cycle: "monthly" },
            "price_abcYEARLY_GROWTH": { planKey: "GROWTH", cycle: "yearly" },
            "price_defMONTHLY_ENTER": { planKey: "ENTERPRISE", cycle: "monthly" },
            "price_ghiYEARLY_ENTER": { planKey: "ENTERPRISE", cycle: "yearly" },
        };

        const found = map[priceId];
        if (!found) {
            throw new Error(`Unknown Stripe price id: ${priceId}`);
        }
        return found;
    }

}
