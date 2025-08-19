// billing.entity.ts

import { BillingCycle, PlanKey, SubscriptionStatus } from "../application/ports/billingmodule.repo";


export class BillingEntity {
  // ----------------------
  // Core state (aggregate)
  // ----------------------
  readonly id: string;
  readonly workspaceId: string;

  private _planKey: PlanKey;
  private _status: SubscriptionStatus;
  private _periodStart: Date;
  private _periodEnd: Date;
  private _billingCycle: BillingCycle;

  private _stripeCustomerId?: string | null;
  private _stripeSubId?: string | null;

  private _cancelAtPeriodEnd?: boolean;
  private _cancelsAt?: Date | null;

  private _createdAt: Date;
  private _updatedAt: Date;

  // ----------------------
  // Constructor (private)
  // ----------------------
  private constructor(params: {
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
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.workspaceId = params.workspaceId;
    this._planKey = params.planKey;
    this._status = params.status;
    this._periodStart = new Date(params.periodStart);
    this._periodEnd = new Date(params.periodEnd);
    this._billingCycle = params.billingCycle;
    this._stripeCustomerId = params.stripeCustomerId ?? null;
    this._stripeSubId = params.stripeSubId ?? null;
    this._cancelAtPeriodEnd = params.cancelAtPeriodEnd ?? false;
    this._cancelsAt = params.cancelsAt ?? null;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;

    this.validateInvariants();
  }

  // ----------------------
  // Factories / Mappers
  // ----------------------

  /** Create from Prisma row */
  static fromPrisma(row: {
    id: string;
    workspaceId: string;
    planKey: PlanKey;
    status: SubscriptionStatus;
    periodStart: Date;
    periodEnd: Date;
    billingCycle: BillingCycle;
    stripeCustomerId?: string | null;
    stripeSubId?: string | null;
    cancelAtPeriodEnd?: boolean | null;
    cancelsAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): BillingEntity {
    return new BillingEntity({
      id: row.id,
      workspaceId: row.workspaceId,
      planKey: row.planKey,
      status: row.status,
      periodStart: row.periodStart,
      periodEnd: row.periodEnd,
      billingCycle: row.billingCycle,
      stripeCustomerId: row.stripeCustomerId ?? null,
      stripeSubId: row.stripeSubId ?? null,
      cancelAtPeriodEnd: !!row.cancelAtPeriodEnd,
      cancelsAt: row.cancelsAt ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  /** Build prisma update/create data from this entity */
  toPrisma(): Record<string, any> {
    return {
      id: this.id,
      workspaceId: this.workspaceId,
      planKey: this._planKey,
      status: this._status,
      periodStart: this._periodStart,
      periodEnd: this._periodEnd,
      billingCycle: this._billingCycle,
      stripeCustomerId: this._stripeCustomerId ?? null,
      stripeSubId: this._stripeSubId ?? null,
      cancelAtPeriodEnd: !!this._cancelAtPeriodEnd,
      cancelsAt: this._cancelsAt ?? null,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  // ----------------------
  // Business getters
  // ----------------------
  get planKey() { return this._planKey; }
  get status() { return this._status; }
  get periodStart() { return this._periodStart; }
  get periodEnd() { return this._periodEnd; }
  get billingCycle() { return this._billingCycle; }
  get stripeCustomerId() { return this._stripeCustomerId ?? null; }
  get stripeSubId() { return this._stripeSubId ?? null; }
  get cancelAtPeriodEnd() { return !!this._cancelAtPeriodEnd; }
  get cancelsAt() { return this._cancelsAt ?? null; }
  get createdAt() { return this._createdAt; }
  get updatedAt() { return this._updatedAt; }

  /** Effective plan = apply status-based downgrades (e.g., frozen/past_due → STARTER) */
  get effectivePlan(): PlanKey {
    if (this._status === 'canceled' || this._status === 'frozen') return 'STARTER';
    // If you treat past_due/grace as limited, decide here:
    if (this._status === 'past_due') return this._planKey; // or 'STARTER' if you want a hard downgrade
    return this._planKey;
  }

  /** Is the subscription currently allowed full access? */
  get isActive(): boolean {
    return this._status === 'active' || this._status === 'trialing' || this._status === 'grace';
  }

  // ----------------------
  // Business commands
  // ----------------------

  /** Mirror Stripe → DB on subscription webhook upsert */
  applyStripeSnapshot(snapshot: {
    planKey: PlanKey;
    billingCycle: BillingCycle;
    status: SubscriptionStatus;
    periodStart: Date;
    periodEnd: Date;
    stripeCustomerId?: string | null;
    stripeSubId?: string | null;
    cancelAtPeriodEnd?: boolean;
    cancelsAt?: Date | null;
    updatedAt?: Date;
  }) {
    this._planKey = snapshot.planKey;
    this._billingCycle = snapshot.billingCycle;
    this._status = snapshot.status;
    this._periodStart = new Date(snapshot.periodStart);
    this._periodEnd = new Date(snapshot.periodEnd);
    this._stripeCustomerId = snapshot.stripeCustomerId ?? this._stripeCustomerId ?? null;
    this._stripeSubId = snapshot.stripeSubId ?? this._stripeSubId ?? null;
    this._cancelAtPeriodEnd = snapshot.cancelAtPeriodEnd ?? false;
    this._cancelsAt = snapshot.cancelsAt ?? null;
    this._updatedAt = snapshot.updatedAt ?? new Date();
    this.validateInvariants();
  }

  /** Mark as active (e.g., on invoice.paid) */
  markActive() {
    this._status = 'active';
    this._updatedAt = new Date();
  }

  /** Enter past_due (invoice.payment_failed) */
  markPastDue() {
    this._status = 'past_due';
    this._updatedAt = new Date();
  }

  /** Set canceled immediately (e.g., subscription.deleted) */
  markCanceled(now = new Date()) {
    this._status = 'canceled';
    this._periodEnd = now;
    this._cancelAtPeriodEnd = false;
    this._cancelsAt = now;
    this._updatedAt = new Date();
  }

  /** Schedule cancel at period end (from Stripe flag cancel_at_period_end) */
  scheduleCancelAtPeriodEnd(cancelsAt?: Date) {
    this._cancelAtPeriodEnd = true;
    this._cancelsAt = cancelsAt ?? this._periodEnd;
    this._updatedAt = new Date();
  }

  /** Resume from scheduled cancel */
  resume() {
    this._cancelAtPeriodEnd = false;
    this._cancelsAt = null;
    if (this._status === 'canceled') this._status = 'active'; // defensive
    this._updatedAt = new Date();
  }

  /** Change the local plan/cycle (rarely used directly; usually Stripe snapshot drives it) */
  changePlan(planKey: PlanKey, cycle: BillingCycle) {
    this._planKey = planKey;
    this._billingCycle = cycle;
    this._updatedAt = new Date();
  }

  // ----------------------
  // Invariants
  // ----------------------
  private validateInvariants() {
    if (this._periodEnd <= this._periodStart) {
      throw new Error('BillingEntity invariant: periodEnd must be after periodStart');
    }
    // If canceled, cancelsAt should be set (soft rule; can relax)
    if (this._status === 'canceled' && !this._cancelsAt) {
      // Allow immediate cancels that set periodEnd = now but no cancelsAt yet.
    }
    // Stripe linkage consistency
    if (this._stripeSubId && !this._stripeCustomerId) {
      // Not strictly required, but usually both are present.
    }
  }
}
