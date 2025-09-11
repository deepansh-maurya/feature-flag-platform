// src/billingmodule/application/ports/billingmodule.repo.ts
export type PlanKey = 'STARTER' | 'GROWTH' | 'ENTERPRISE';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'grace' | 'frozen' | 'canceled';

export const BillingmoduleRepoToken = Symbol('BillingmoduleRepo');

export class StartCheckoutDto {
  workspaceId!: string;
  planKey!: PlanKey;
  cycle!: BillingCycle;
  prefillName?: string;
  prefillEmail?: string;
  prefillContact?: string;
  razorpayCustomerId?: string;
}

export class ChangePlanDto {
  workspaceId!: string;
  newPlanKey!: PlanKey;
  cycle!: BillingCycle;
  // Razorpay has no native prorations; you decide policy in code
  immediate?: boolean; // default true: cancel now + create new
  carryOverDays?: boolean; // if true, extend next period manually
}

export class CancelDto {
  workspaceId!: string;
  atPeriodEnd!: boolean; // maps to cancel_at_cycle_end: 1|0
}

export class ResumeDto {
  workspaceId!: string;
  // Razorpay can’t truly "resume" a canceled sub → we create a new subscription
  planKey!: PlanKey;
  cycle!: BillingCycle;
}

export class PortalDto {
  workspaceId!: string;
  returnUrl?: string;
}

export class SubscriptionDto {
  id!: string;
  workspaceId!: string;
  planKey!: PlanKey;
  status!: SubscriptionStatus;
  periodStart!: Date;
  periodEnd!: Date;
  billingCycle!: BillingCycle;
  razorpayCustomerId?: string | null;
  razorpaySubId?: string | null;
  cancelAtPeriodEnd?: boolean;
  cancelsAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}

export class EntitlementsDto {
  workspaceId!: string;
  effectivePlan!: PlanKey;
  status!: SubscriptionStatus;
  limits!: Record<string, number | boolean>;
  features!: Record<string, boolean>;
}

// Webhook upsert payload (Razorpay → DB)
export class UpsertFromRazorpaySubscriptionDto {
  razorpaySubId!: string;
  razorpayCustomerId!: string | null;
  workspaceId!: string;
  planKey!: PlanKey;
  billingCycle!: BillingCycle;
  status!: SubscriptionStatus;
  periodStart!: Date;
  periodEnd!: Date;
  cancelAtPeriodEnd?: boolean;
  cancelsAt?: Date | null;
}

export class ReconciliationSubscriptionItemDto {
  workspaceId!: string;
  razorpaySubId!: string;
}

// Returned to FE to open Razorpay Checkout modal
export class CheckoutInitDto {
  keyId!: string;
  subscriptionId!: string;
  planKey!: PlanKey;
  cycle!: BillingCycle;
  amount!: number;     // paise
  currency!: 'INR';
  notes!: Record<string, string>;
  prefill?: { name?: string; email?: string; contact?: string };
}

export interface BillingmoduleRepo {
  // Commands
  startCheckout(input: StartCheckoutDto): Promise<CheckoutInitDto>;
  changePlan(input: ChangePlanDto): Promise<void>;
  cancel(input: CancelDto): Promise<void>;
  resume(input: ResumeDto): Promise<void>;
  createPortalSession(input: PortalDto): Promise<{ url: string }>; // your app’s own "billing portal" page

  // Queries
  getCurrentSubscription(workspaceId: string): Promise<SubscriptionDto | null>;
  getEntitlements(workspaceId: string): Promise<EntitlementsDto>;

  // Webhook sync (Razorpay → DB)
  upsertFromRazorpaySubscription(payload: UpsertFromRazorpaySubscriptionDto): Promise<void>;
  setStatusActiveByRazorpaySubId(razorpaySubId: string): Promise<void>;
  setStatusPastDueByRazorpaySubId(razorpaySubId: string): Promise<void>;
  setCanceledByRazorpaySubId(input: { razorpaySubId: string; periodEnd?: Date }): Promise<void>;

  // Idempotency / Reconciliation
  isWebhookEventProcessed(dedupeKey: string): Promise<boolean>;
  markWebhookEventProcessed(dedupeKey: string): Promise<void>;
  listSubscriptionsForReconciliation(): Promise<Array<ReconciliationSubscriptionItemDto>>;
  patchSubscriptionByRazorpaySubId(patch: Partial<SubscriptionDto> & { razorpaySubId: string }): Promise<void>;

  // Customer linkage
  getRazorpayCustomerId(workspaceId: string): Promise<string | null>;
  setRazorpayCustomerId(workspaceId: string, razorpayCustomerId: string): Promise<void>;

  // Mapping helpers
  getRazorpayPlanId(planKey: PlanKey, cycle: BillingCycle): Promise<string>;
  mapRazorpayPlanId(planId: string): Promise<{ planKey: PlanKey; cycle: BillingCycle }>;
}
