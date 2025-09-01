// billing.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsISO8601,
  IsJSON,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/** Enums (use these in Prisma schema too for consistency) */
export enum PlanKey {
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  ENTERPRISE = 'ENTERPRISE',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  GRACE = 'grace',
  FROZEN = 'frozen',
  CANCELED = 'canceled',
}

/** ========== Core DTOs for write endpoints ========== */

export class StartCheckoutDto {
  @ApiProperty()
  @IsString()
  workspaceId!: string; // use IsUUID() if your workspaceId is a UUID

  @ApiProperty({ enum: PlanKey })
  @IsEnum(PlanKey)
  planKey!: PlanKey;

  @ApiProperty({ enum: BillingCycle })
  @IsEnum(BillingCycle)
  cycle!: BillingCycle;

  @IsNumber()
  amountInINR: number

  @IsString()
  currency: string


  @IsString()
  receipt?: string

  @IsString()
  notes?: string

  @IsString()
  purpose?: string

  @IsJSON()
  metadata?: JSON

}

export class ChangePlanDto {
  @ApiProperty()
  @IsString()
  workspaceId!: string;

  @ApiProperty({ enum: PlanKey })
  @IsEnum(PlanKey)
  newPlanKey!: PlanKey;

  @ApiProperty({ enum: BillingCycle })
  @IsEnum(BillingCycle)
  cycle!: BillingCycle;

  @ApiPropertyOptional({ enum: ['create_prorations', 'none'] })
  @IsOptional()
  @IsEnum(['create_prorations', 'none'] as const)
  proration?: 'create_prorations' | 'none';
}

export class CancelDto {
  @ApiProperty()
  @IsString()
  workspaceId!: string;

  @ApiProperty()
  @IsBoolean()
  atPeriodEnd!: boolean;
}

export class  ResumeDto {
  @ApiProperty()
  @IsString()
  workspaceId!: string;
}

export class PortalDto {
  @ApiProperty()
  @IsString()
  workspaceId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false }) // allow localhost/dev URLs
  returnUrl?: string;
}

/** ========== Read/response DTOs ========== */

export type FeatureKey = string;

// Helper for Date transformation when returning/parsing ISO strings
const toDate = ({ value }: { value: any }) =>
  typeof value === 'string' ? new Date(value) : value;

export class SubscriptionDto {
  @ApiProperty()
  @IsUUID()
  id!: string;

  @ApiProperty()
  @IsString()
  workspaceId!: string;

  @ApiProperty({ enum: PlanKey })
  @IsEnum(PlanKey)
  planKey!: PlanKey;

  @ApiProperty({ enum: SubscriptionStatus })
  @IsEnum(SubscriptionStatus)
  status!: SubscriptionStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsISO8601()
  @Transform(toDate)
  periodStart!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsISO8601()
  @Transform(toDate)
  periodEnd!: Date;

  @ApiProperty({ enum: BillingCycle })
  @IsEnum(BillingCycle)
  billingCycle!: BillingCycle;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stripeCustomerId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stripeSubId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  cancelAtPeriodEnd?: boolean;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  @IsOptional()
  @IsISO8601()
  @Transform(toDate)
  cancelsAt?: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsISO8601()
  @Transform(toDate)
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsISO8601()
  @Transform(toDate)
  updatedAt!: Date;
}

export class EntitlementsDto {
  @ApiProperty()
  @IsString()
  workspaceId!: string;

  @ApiProperty({ enum: PlanKey })
  @IsEnum(PlanKey)
  effectivePlan!: PlanKey;

  @ApiProperty({ enum: SubscriptionStatus })
  @IsEnum(SubscriptionStatus)
  status!: SubscriptionStatus;

  @ApiProperty({ type: 'object', additionalProperties: { oneOf: [{ type: 'number' }, { type: 'boolean' }] } })
  @IsObject()
  limits!: Record<string, number | boolean>;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'boolean' } })
  @IsObject()
  features!: Record<FeatureKey, boolean>;
}




/** Webhook → service payload */
export class UpsertFromStripeSubscriptionDto {
  @ApiProperty()
  @IsString()
  stripeSubId!: string;

  @ApiProperty()
  @IsString()
  stripeCustomerId!: string;

  @ApiProperty({ description: 'Resolved from customer/metadata' })
  @IsString()
  workspaceId!: string;

  @ApiProperty({ enum: PlanKey })
  @IsEnum(PlanKey)
  planKey!: PlanKey;

  @ApiProperty({ enum: BillingCycle })
  @IsEnum(BillingCycle)
  billingCycle!: BillingCycle;

  @ApiProperty({ enum: SubscriptionStatus })
  @IsEnum(SubscriptionStatus)
  status!: SubscriptionStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  periodStart!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  periodEnd!: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  cancelAtPeriodEnd?: boolean;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  cancelsAt?: Date | null;
}

/** Reconciliation item (list result element) */
export class ReconciliationSubscriptionItemDto {
  @ApiProperty()
  @IsString()
  workspaceId!: string;

  @ApiProperty()
  @IsString()
  stripeSubId!: string;
}

export class VerifyHandlerDto {

  @IsString()
  razorpay_payment_id: string
  @IsString()

  razorpay_order_id: string
  @IsString()

  razorpay_signature: string
  @IsString()

  internalOrderId: string
  @IsJSON()
  metadata: JSON
}

export interface StartCheckout {
  orderId: string, amount: number, currency: string,
  keyId: string, internalOrderId: string
}