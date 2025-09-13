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
import { KeyStatus, SdkKeyType, SdkPlatform } from 'generated/prisma';

/* =========================
 * Response DTOs (reads)
 * ========================= */

export class ProjectSummaryDto {
  @IsUUID() id: string;
  @IsUUID() workspaceId: string;

  @IsString() @IsNotEmpty() name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class EnvironmentDto {
  @IsUUID() id: string;
  @IsUUID() projectId: string;

  @IsString() @IsNotEmpty() key: string;
  @IsString() @IsNotEmpty() displayName: string;

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
  @IsUUID() workspaceId: string;

  @IsString() @IsNotEmpty() name: string;

  @IsString()
  timeZone: string;

  @IsJSON()
  guardrails: JSON;

  @IsArray()
  langSupport: SdkPlatform[];
}

export class UpdateProjectDto {
  @IsUUID() id: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class AddEnvironmentDto {
  @IsUUID() projectId: string;
  @IsUUID() workspaceId: string;

  @IsString() @IsNotEmpty() key: string;
  @IsString() @IsNotEmpty() displayName: string;
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
