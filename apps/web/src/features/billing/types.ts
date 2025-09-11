export type PlanKey = "starter" | "growth" | "enterprise";
export type BillingCycle = "monthly" | "yearly";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid";

// Commands
export interface StartCheckout {
  workspaceId: string;
  planKey: PlanKey;
  cycle: BillingCycle;
  prefillName?: string;
  prefillEmail?: string;
  prefillContact?: string;
}

export interface ChangePlan {
  workspaceId: string;
  planKey: PlanKey;
  cycle: BillingCycle;
}

export interface Cancel {
  workspaceId: string;
  atPeriodEnd?: boolean; // default true
}

export interface Resume {
  workspaceId: string;
}

export interface Portal {
  workspaceId: string;
  returnUrl?: string;
}

// Queries
export interface Subscription {
  workspaceId: string;
  planKey: PlanKey;
  cycle: BillingCycle;
  status: SubscriptionStatus;
  stripeSubId: string;
  priceId: string;
  currentPeriodStart: string; // ISO
  currentPeriodEnd: string; // ISO
  cancelAtPeriodEnd: boolean;
}

export interface Entitlements {
  planKey: PlanKey;
  cycle: BillingCycle;
  status: SubscriptionStatus;
  limits: {
    workspaces: number | "unlimited";
    projects: number | "unlimited";
    environmentsPerWorkspace: number | "unlimited";
    seats: number | "unlimited";
    flags: number | "unlimited";
    segments: number | "unlimited" | 0;
    apiRequestsPerMonth: number | "unlimited" | "custom";
    webhooks: number | "unlimited" | 0;
    auditRetentionDays: number | "unlimited" | 0;
  };
  features: {
    experiments: boolean | "advanced";
    advancedRules: boolean;
    integrations: boolean;
    rbac: boolean;
    sso: boolean;
  };
}

export interface CheckoutInitDto {
  keyId: string;
  subscriptionId: string;
  planKey: PlanKey;
  cycle: BillingCycle;
  amount: number; // paise
  currency: "INR";
  notes: Record<string, string>;
  prefill?: { name?: string; email?: string; contact?: string };
}
