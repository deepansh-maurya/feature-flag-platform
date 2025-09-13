import { Type } from 'class-transformer';
import {
  IsArray,
  ArrayMinSize,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { BillingCycle, PlanStatus } from 'generated/prisma'

export class PriceInputDto {
  @IsEnum(BillingCycle) recurringInterval!: BillingCycle; // "monthly" | "yearly"
  @IsString() currency!: string;                          // "usd", "inr", ...
  @IsInt() @Min(0) unitAmountCents!: number;             // 9900 => $99.00
  @IsOptional() @IsBoolean() isMetered?: boolean;
  @IsOptional() @IsString() meterKey?: string | null;
  @IsOptional() @IsBoolean() active?: boolean;           // default true in service
}

export class FeatureItemDto {
  @IsString() key!: string;         // e.g., "sso", "experiments"
  @IsBoolean() enabled!: boolean;
  @IsOptional() @IsString() notes?: string;
}

export class LimitItemDto {
  @IsString() resource!: string;    // e.g., "flags", "seats", "projects"
  @IsOptional() @IsInt() @Min(0) soft?: number | null;
  @IsOptional() @IsInt() @Min(0) hard?: number | null;
}

export class CreatePlanDto {
  @IsString() key!: string;         // "starter"
  @IsString() name!: string;        // "Starter"
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(0) trialDays?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PriceInputDto)
  prices!: PriceInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureItemDto)
  features?: FeatureItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LimitItemDto)
  limits?: LimitItemDto[];
}


export class PublishPlanDto {
  @IsUUID() planId!: string;
}

export class ArchivePlanDto {
  @IsUUID() planId!: string;
}

export class GetPlanByIdDto {
  @IsUUID() planId!: string;
}

export class GetPlanByKeyDto {
  @IsString() planKey!: string; // "starter"
}

export class ListPlansDto {
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus; // draft | active | archived
}


export class UpsertPriceDto {
  @IsUUID() planId!: string;

  @IsEnum(BillingCycle) recurringInterval!: BillingCycle;
  @IsString() currency!: string;
  @IsInt() @Min(0) unitAmountCents!: number;

  @IsOptional() @IsBoolean() isMetered?: boolean;
  @IsOptional() @IsString() meterKey?: string | null;

  // Optional Stripe linkage if you mirror IDs here
  @IsOptional() @IsString() stripeProductId?: string;
  @IsOptional() @IsString() stripePriceId?: string;

  @IsOptional() @IsBoolean() active?: boolean;
}

export class SetPriceActiveDto {
  @IsUUID() planId!: string;
  @IsUUID() priceId!: string;
  @IsBoolean() active!: boolean;
}

export class FeatureUpsertItemDto {
  @IsString() key!: string;
  @IsBoolean() enabled!: boolean;
  @IsOptional() @IsString() notes?: string;
}

export class UpsertFeaturesDto {
  @IsUUID() planId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureUpsertItemDto)
  items!: FeatureUpsertItemDto[];
}

export class LimitUpsertItemDto {
  @IsString() resource!: string;
  @IsOptional() @IsInt() @Min(0) soft?: number | null;
  @IsOptional() @IsInt() @Min(0) hard?: number | null;
}

export class UpsertLimitsDto {
  @IsUUID() planId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LimitUpsertItemDto)
  items!: LimitUpsertItemDto[];
}

export class DeletePriceDto {
  @IsUUID() planId!: string;
  @IsUUID() priceId!: string;
}

export class DeleteFeatureDto {
  @IsUUID() planId!: string;
  @IsString() key!: string;
}

export class DeleteLimitDto {
  @IsUUID() planId!: string;
  @IsString() resource!: string;
}


export class EnrollDto {
  @IsString() passKey: string
}