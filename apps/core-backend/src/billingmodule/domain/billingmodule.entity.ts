import { BillingCycle, PlanKey, SubscriptionStatus } from "../application/ports/billingmodule.repo";

export class BillingEntity {
  private constructor(
    readonly id: string,
    readonly workspaceId: string,
    readonly planKey: PlanKey,
    readonly status: SubscriptionStatus,
    readonly periodStart: Date,
    readonly periodEnd: Date,
    readonly billingCycle: BillingCycle,
    readonly stripeCustomerId?: string | null,
    readonly stripeSubId?: string | null,
    readonly cancelAtPeriodEnd?: boolean,
    readonly cancelsAt?: Date | null,
    readonly createdAt?: Date,
    readonly updatedAt?: Date,
  ) { }

  static create(params: {
    id: string;
    workspaceId: string;
    planKey: PlanKey;
    status: SubscriptionStatus;
    periodStart: Date;
    periodEnd: Date;
    billingCycle: BillingCycle;
    stripeCustomerId?: string | null;
    stripeSubId?: string | null;
    cancelAtPeriodEnd?: boolean;
    cancelsAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    if (!params.workspaceId) {
      throw new Error("workspaceId required");
    }
    if (!params.planKey) {
      throw new Error("planKey required");
    }
    if (!params.periodStart || !params.periodEnd) {
      throw new Error("periodStart and periodEnd required");
    }
    if (params.periodEnd <= params.periodStart) {
      throw new Error("periodEnd must be after periodStart");
    }

    return new BillingEntity(
      params.id,
      params.workspaceId,
      params.planKey,
      params.status,
      params.periodStart,
      params.periodEnd,
      params.billingCycle,
      params.stripeCustomerId,
      params.stripeSubId,
      params.cancelAtPeriodEnd,
      params.cancelsAt,
      params.createdAt ?? new Date(),
      params.updatedAt ?? new Date(),
    );
  }
}
