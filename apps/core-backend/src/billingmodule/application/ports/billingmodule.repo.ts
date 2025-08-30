import { BillingCycle, PlanKey } from "generated/prisma";
import { CancelDto, ChangePlanDto, EntitlementsDto, PortalDto, ReconciliationSubscriptionItemDto, ResumeDto, StartCheckout, StartCheckoutDto, SubscriptionDto, UpsertFromStripeSubscriptionDto, VerifyHandlerDto } from "src/billingmodule/interface/dto/create-billingmodule.dto";

// billingmodule.repo.ts
export const BillingmoduleRepoToken = Symbol('BillingmoduleRepo');

/** Domain types (match your Prisma model + enums) */

export interface BillingmoduleRepo {
  // ---------------------------------------------------------------------------
  // Commands (FE -> your API)  — These call Stripe and return URLs or 204s
  // ---------------------------------------------------------------------------
  /** Create Stripe Checkout Session URL for buying a subscription */
  startCheckout(input: StartCheckoutDto): Promise<StartCheckout>;
  verifyHandler(input: VerifyHandlerDto): Promise<boolean>

  /** Change plan (upgrade/downgrade); DB sync happens via webhook */
  changePlan(input: ChangePlanDto): Promise<void>;

  /** Cancel subscription (immediate or at period end); DB sync via webhook */
  cancel(input: CancelDto): Promise<void>;

  /** Resume subscription (if cancel_at_period_end was set); DB sync via webhook */
  resume(input: ResumeDto): Promise<void>;

  /** Create Stripe Billing Portal session URL (manage payment method/invoices) */
  createPortalSession(input: PortalDto): Promise<{ url: string }>;

  // ---------------------------------------------------------------------------
  // Queries (your UI reads fast from your DB)
  // ---------------------------------------------------------------------------
  /** Read the current subscription for a workspace from DB (or null if none) */
  getCurrentSubscription(workspaceId: string): Promise<SubscriptionDto | null>;

  /** Compute feature access/limits from planKey + status */
  getEntitlements(workspaceId: string): Promise<EntitlementsDto>;

  // ---------------------------------------------------------------------------
  // Stripe-sync (Webhook handlers call these to persist Stripe → DB)
  // Keep these low-level & idempotent. Implementation upserts by stripeSubId.
  // ---------------------------------------------------------------------------
  /** Upsert Subscription from a Stripe Subscription payload (already parsed) */
  upsertFromStripeSubscription(payload: UpsertFromStripeSubscriptionDto): Promise<void>;

  /** On invoice paid → usually flip to active if needed */
  setStatusActiveByStripeSubId(stripeSubId: string): Promise<void>;

  /** On invoice payment_failed → mark past_due */
  setStatusPastDueByStripeSubId(stripeSubId: string): Promise<void>;

  /** Mark canceled (immediate) with final periodEnd if provided */
  setCanceledByStripeSubId(input: {
    stripeSubId: string;
    periodEnd?: Date;
  }): Promise<void>;

  // ---------------------------------------------------------------------------
  // Reconciliation / Idempotency helpers
  // ---------------------------------------------------------------------------
  /** Return true if this Stripe event.id was already processed (for dedupe) */
  isWebhookEventProcessed(eventId: string): Promise<boolean>;

  /** Persist that a Stripe event.id has been processed */
  markWebhookEventProcessed(eventId: string): Promise<void>;

  /** For nightly jobs: list all known subscriptions that appear "active-ish" */
  listSubscriptionsForReconciliation(): Promise<Array<ReconciliationSubscriptionItemDto>>;

  /** Directly patch a subscription row when reconciling mismatches */
  patchSubscriptionByStripeSubId(patch: Partial<SubscriptionDto> & { stripeSubId: string }): Promise<void>;

  // ---------------------------------------------------------------------------
  // Customer linkage utilities (often needed before first checkout)
  // ---------------------------------------------------------------------------
  /** Get stored Stripe customer id for a workspace (if you cache it on workspace) */
  getStripeCustomerId(workspaceId: string): Promise<string | null>;

  /** Save/attach a Stripe customer id for a workspace */
  setStripeCustomerId(workspaceId: string, stripeCustomerId: string): Promise<void>;

  // ---------------------------------------------------------------------------
  // Mapping helpers (infra can implement using your price map)
  // ---------------------------------------------------------------------------
  /** Given a Stripe price id, return the domain PlanKey + BillingCycle */
  mapPriceId(priceId: string): Promise<{ planKey: PlanKey; cycle: BillingCycle }>;
}
