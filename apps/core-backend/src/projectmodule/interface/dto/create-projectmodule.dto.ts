import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { KeyStatus, SdkKeyType } from 'generated/prisma';

/* =========================
 * Response DTOs (reads)
 * ========================= */

export class ProjectSummaryDto {
  @IsUUID() id: string;
  @IsUUID() workspaceId: string;

  @IsString() @IsNotEmpty() name: string;
  @IsString()
  timeZone: string;

  // rollout policies stored as JSON in DB
  rolloutPollicies: any;

  // array of sdk platform keys
  langSupport: string[];

  createdAt: Date;
  updatedAt: Date;
}

export class EnvironmentDto {
  @IsUUID() id: string;
  @IsUUID() projectId: string;

  @IsString() @IsNotEmpty() key: string;
  @IsString() @IsNotEmpty() displayName: string;

  isDefault:boolean
  isProd:boolean

  createdAt: Date;
  updatedAt: Date;
}

export class SdkKeyDto {
  @IsUUID() id: string;
  @IsUUID() projectId: string;
  @IsUUID() workspaceId: string;

  @IsString() @IsNotEmpty() envKey: string;
  @IsEnum(SdkKeyType) type: SdkKeyType;
  @IsEnum(KeyStatus) status: KeyStatus;

  lastUsedAt: Date | null;
  rotatedAt: Date | null;

  @IsString() createdBy: string;

  createdAt: Date;
  updatedAt: Date;
}

export class ListProjectsResultDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectSummaryDto)
  items: ProjectSummaryDto[];

  @IsOptional()
  @IsString()
  nextCursor: string | null;
}

/* =========================
 * Input DTOs (writes)
 * ========================= */

export class CreateProjectEnvDto {
  @IsString() @IsNotEmpty() key: string;
  @IsString() @IsNotEmpty() displayName: string;
}

export class CreateProjectKeyDto {
  @IsString() @IsNotEmpty() envKey: string;
  @IsEnum(SdkKeyType) type: SdkKeyType;
  @IsString() @IsNotEmpty() keyHash: string; // plaintext never enters the repo
  @IsString() createdBy: string;
}

export class CreateProjectDto {
  @IsString() workspaceId: string;

  @IsString() @IsNotEmpty() name: string;

  @IsString()
  timeZone: string;

  // guardrails stored as JSON in DB; clients will send an object
  guardrails: any;

  // array of sdk platform ids
  @IsNotEmpty()
  langSupport: string[];
}

// DTO clients send when creating a project. workspaceId is injected server-side
export class CreateProjectRequestDto {
  @IsString() @IsNotEmpty() name: string;

  @IsString()
  timeZone: string;

  @IsOptional()
  guardrails: any;

  @IsNotEmpty()
  langSupport: string[];
}

export class UpdateProjectDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  timeZone?: string;

  @IsOptional()
  guardrails?: any;

  @IsOptional()
  @IsNotEmpty()
  langSupport?: string[];
}

export class AddEnvironmentDto {
  @IsNotEmpty() projectId: string;
  @IsNotEmpty() workspaceId: string;
  @IsOptional() isDefault?: any;
  @IsOptional() isProd?: any;
  @IsString() @IsNotEmpty() key: string;
  @IsString() @IsNotEmpty() displayName: string;
}

export class UpdateEnvironmentDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isProd?: boolean;
}

export class IssueSdkKeyDto {
  @IsUUID() projectId: string;
  @IsUUID() workspaceId: string;

  @IsString() @IsNotEmpty() envKey: string;
  @IsEnum(SdkKeyType) type: SdkKeyType;

  @IsString() @IsNotEmpty() keyHash: string;
  @IsString() createdBy: string;
}

export class RevokeSdkKeyDto {
  @IsUUID() sdkKeyId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class RotateSdkKeyDto {
  @IsUUID() projectId: string;
  @IsUUID() workspaceId: string;

  @IsString() @IsNotEmpty() envKey: string;
  @IsEnum(SdkKeyType) type: SdkKeyType;

  @IsString() @IsNotEmpty() newKeyHash: string;
  @IsString() createdBy: string;

  @IsOptional()
  @IsBoolean()
  keepOldActive?: boolean;
}
