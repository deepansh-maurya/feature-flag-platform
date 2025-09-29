import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class RecordEvaluationDto {
  @IsString()
  flagId: string;

  @IsString()
  envKey: string; // dev | stage | prod

  @IsString()
  userId: string;

  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @IsString()
  variant?: string; // e.g. control / treatment

  @IsOptional()
  @IsString()
  ruleMatched?: string; // e.g. geo-IN, plan-pro, fallthrough

  @IsDateString()
  evaluatedAt: Date; // ISO string → convert to Date in service
}
export class GetOverviewDto {
  @IsString()
  projectId: string;

  @IsString()
  envKey: string;

  @IsDateString()
  from: Date; // ISO string

  @IsDateString()
  to: Date; // ISO string
}
export class GetFlagMetricsDto {
  @IsString()
  flagId: string;

  @IsString()
  envKey: string;

  @IsDateString()
  from: Date;

  @IsDateString()
  to: Date;
}
