import { Inject, Injectable } from '@nestjs/common';
import { BillingmoduleRepo, BillingmoduleRepoToken, } from '../ports/billingmodule.repo';
import { BillingEntity } from 'src/billingmodule/domain/billingmodule.entity';

@Injectable()
export class BillingmoduleService {
    constructor(
        @Inject(BillingmoduleRepoToken) private readonly repo: BillingmoduleRepo,
    ) { }

    /** Get current subscription for a workspace */
    async getSubscription(workspaceId: string): Promise<BillingEntity | null> {
        const row = await this.repo.getCurrentSubscription(workspaceId);
        return row ? BillingEntity.create(row) : null;
    }

    /** Start a new checkout session (delegates to repo which talks to Stripe) */
    async startCheckout(workspaceId: string, planKey: any, cycle: any): Promise<{ url: string }> {
        return this.repo.startCheckout({ workspaceId, planKey, cycle });
    }

    /** Change current plan (upgrade/downgrade) */
    async changePlan(workspaceId: string, planKey: any, cycle: any): Promise<void> {
        return this.repo.changePlan({ workspaceId, newPlanKey: planKey, cycle });
    }

    /** Cancel subscription immediately */
    async cancelSubscription(workspaceId: string, atPeriodEnd: boolean): Promise<void> {
        return this.repo.cancel({ workspaceId: workspaceId, atPeriodEnd: atPeriodEnd });
    }

    /** Resume subscription (if cancel_at_period_end was set) */
    async resumeSubscription(workspaceId: string): Promise<void> {
        return this.repo.resume({ workspaceId });
    }

    /** For webhooks: upsert subscription snapshot coming from Stripe */
    async upsertFromStripeSubscription(dto: any): Promise<void> {
        return this.repo.upsertFromStripeSubscription(dto);
    }

    /** For webhooks: mark event processed (idempotency) */
    async markWebhookEventProcessed(eventId: string): Promise<void> {
        return this.repo.markWebhookEventProcessed(eventId);
    }

    /** Check if a webhook event was already processed */
    async isWebhookEventProcessed(eventId: string): Promise<boolean> {
        return this.repo.isWebhookEventProcessed(eventId);
    }
}
