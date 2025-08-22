import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsISO8601,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export enum RuleKind {
  Deny = 'deny',
  Allow = 'allow',
}

export enum Operator {
  EQ = 'eq',
  IN = 'in',
  NOT_IN = 'not_in',
  REGEX = 'regex',
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte',
  SEMVER_GTE = 'semver_gte',
  CIDR_IN = 'cidr_in',
  BETWEEN = 'between',           // numeric range
  TIME_WINDOW = 'time_window',   // ISO start/end
}

export class TimeWindowDto {
  @IsOptional() @IsISO8601() startIso?: string;
  @IsOptional() @IsISO8601() endIso?: string;
}

export class RangeDto {
  @IsInt() start!: number;
  @IsInt() end!: number;
}

export class ConditionDto {
  @IsString() @Length(1, 64) attr!: string;

  @IsEnum(Operator) op!: Operator;

  // Single value forms
  @IsOptional() value?: any;

  // Multi value forms
  @IsOptional() @IsArray() @ArrayNotEmpty() values?: any[];

  // Numeric range
  @IsOptional() @ValidateNested() @Type(() => RangeDto) range?: RangeDto;

  // Time window
  @IsOptional() @ValidateNested() @Type(() => TimeWindowDto) window?: TimeWindowDto;
}

/**
 * Match tree: any (OR) | all (AND) | cond (leaf) | segmentId reference
 */
export class MatchDto {
  @IsOptional() @ValidateNested({ each: true }) @Type(() => MatchDto) any?: MatchDto[];
  @IsOptional() @ValidateNested({ each: true }) @Type(() => MatchDto) all?: MatchDto[];
  @IsOptional() @ValidateNested() @Type(() => ConditionDto) cond?: ConditionDto;
  @IsOptional() @IsString() segmentId?: string;
}

export class RolloutAllocationDto {
  @IsString() variation!: string;          // variation key
  @IsInt() @Min(0) @Max(100) percent!: number;
}

export class DistributionDto {
  @IsOptional() @IsString() stickinessAttr?: string; // default: userId (handled in service/SDK)
  @ValidateNested({ each: true }) @Type(() => RolloutAllocationDto)
  @ArrayNotEmpty() allocations!: RolloutAllocationDto[]; // percent sum validated in service
}

export class OutcomeDto {
  @IsOptional() @IsString() fixedVariation?: string;
  @IsOptional() @ValidateNested() @Type(() => DistributionDto) rollout?: DistributionDto;
}

export class RuleDto {
  @IsEnum(RuleKind) kind!: RuleKind;

  // Optional enable flag for UI toggles (absent/false = enabled)
  @IsOptional() @IsBoolean() disabled?: boolean;

  @ValidateNested() @Type(() => MatchDto) match!: MatchDto;

  @IsOptional() @ValidateNested() @Type(() => OutcomeDto) outcome?: OutcomeDto;

  @IsOptional() @IsString() reason?: string; // free-text note for auditors
}

export class PrerequisiteDto {
  @IsString() flagKey!: string;

  // required variations on the prerequisite flag
  @IsArray() @ArrayNotEmpty() @IsString({ each: true })
  variations!: string[];
}

export class UpsertRuleSetDto {
  @IsString() flagId!: string;                 // redundant with path ok for services
  @IsString() @IsIn(['dev', 'stage', 'prod']) envKey!: 'dev' | 'stage' | 'prod';

  @IsOptional() @IsString() defaultVar?: string;
  @IsOptional() @IsBoolean() killswitch?: boolean;

  @IsOptional() @ValidateNested({ each: true }) @Type(() => RuleDto)
  rules?: RuleDto[];

  @IsOptional() @ValidateNested({ each: true }) @Type(() => PrerequisiteDto)
  prerequisites?: PrerequisiteDto[];

  // optional: salt override for hashing (usually generated server-side)
  @IsOptional() @IsString() salt?: string;
}

export class TestEvaluateDto {
  @IsString() flagId!: string;
  @IsString() envKey!: string; // dev|stage|prod

  @IsObject() traits!: Record<string, any>;  // { userId, country, plan, ... }

  @IsOptional() @IsISO8601() nowIso?: string; // evaluation timestamp override
}
export class PublishRuleSetDto {
  /** Optional release notes shown in History */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
