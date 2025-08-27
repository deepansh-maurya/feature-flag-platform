export type BillingCycle = 'monthly' | 'yearly';
export type PlanStatus = 'draft' | 'active' | 'archived';

export type PriceInput = {
  recurringInterval: BillingCycle;
  currency: string;
  unitAmountCents: number;
  isMetered?: boolean;
  meterKey?: string | null;
  active?: boolean;
};

export type FeatureItem = { key: string; enabled: boolean; notes?: string };
export type LimitItem = { resource: string; soft?: number | null; hard?: number | null };
export type CreatePlan = {
  key: string;
  name: string;
  description?: string;
  trialDays?: number;
  prices: PriceInput[];
  features?: FeatureItem[];
  limits?: LimitItem[];
};

export type PlanAggregate = {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  status: PlanStatus;
  trialDays: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  prices: Array<{
    id: string;
    recurringInterval: BillingCycle;
    currency: string;
    unitAmountCents: number;
    isMetered: boolean;
    meterKey?: string | null;
    active: boolean;
  }>;
  features: Array<{ id: string; key: string; enabled: boolean }>;
  limits: Array<{ id: string; resource: string; soft?: number | null; hard?: number | null }>;
};


export type PlanKey = "starter" | "growth" | "enterprise" | string;

export interface Price {
  id: string;
  planId: string;
  cycle: BillingCycle;
  unitAmount: number;            // cents
  currency: string;              // e.g. "USD"
  stripePriceId?: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanLimit {
  key: string;                   // e.g. "flags" | "seats" | "apiRequestsPerMonth"
  value: number | "unlimited" | "custom" | 0;
}

export interface PlanFeature {
  key: string;                   // e.g. "rbac" | "sso" | "integrations"
  label?: string;
  included: boolean | "advanced";
  sort?: number;
}

// ----------------- DTOs (mirror your backend DTOs) -----------------
export interface CreatePlan {
  key: PlanKey;
  name: string;
  description?: string;
  badge?: string;
  sortOrder?: number;
  // optional initial config
  prices?: Array<{
    cycle: BillingCycle;
    unitAmount: number;
    currency?: string;
    active?: boolean;
  }>;
  limits?: PlanLimit[];
  features?: PlanFeature[];
}

export interface PublishPlan { planId: string; }
export interface ArchivePlan { planId: string; }

export interface GetPlanById { planId: string; }
export interface GetPlanByKey { planKey: PlanKey; }
export interface ListPlans { status?: PlanStatus; includeArchived?: boolean; }

export interface UpsertPrice {
  planId: string;
  id?: string;                   // if provided → update, else create
  cycle: BillingCycle;
  unitAmount: number;            // cents
  currency?: string;             // default "USD"
  active?: boolean;
  stripePriceId?: string;
}
export interface SetPriceActive { priceId: string; active: boolean; }

export interface UpsertFeatures { planId: string; features: PlanFeature[]; }
export interface UpsertLimits { planId: string; limits: PlanLimit[]; }

export interface DeletePrice { priceId: string; }
export interface DeleteFeature { planId: string; key: string; }
export interface DeleteLimit { planId: string; key: string; }
