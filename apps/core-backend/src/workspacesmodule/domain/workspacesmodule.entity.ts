// domain/workspacesmodule.entity.ts

import { BillingStatus } from 'generated/prisma';

export class WorkspaceEntity {
  // ----------------------
  // Core state (aggregate)
  // ----------------------
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly stripeCustomerId?: string;
  readonly ownerUserId: string;
  private _planKey: string;
  private _billingStatus: BillingStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  private _archived: boolean;

  constructor(params: {
    id: string;
    name: string;
    slug: string;
    ownerUserId: string;
    planKey: string;
    billingStatus: BillingStatus;
    stripeCustomerId?: string;
    createdAt: Date;
    updatedAt: Date;
    archived?: boolean;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.slug = params.slug;
    this.ownerUserId = params.ownerUserId;
    this._planKey = params.planKey;
    this._billingStatus = params.billingStatus;
    this.stripeCustomerId = params.stripeCustomerId;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this._archived = params.archived ?? false;
  }
}
