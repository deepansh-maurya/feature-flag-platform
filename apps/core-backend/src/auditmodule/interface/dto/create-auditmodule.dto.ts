import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AuditActionType } from 'generated/prisma'

export class AppendAuditLogDto {
  @IsString() @IsNotEmpty() workspaceId!: string;
  @IsOptional() @IsString() projectId?: string | null;
  @IsOptional() @IsString() envKey?: string | null;

  @IsString() entityType!: string;
  @IsString() entityId!: string;
  @IsOptional() @IsString() entityKey?: string | null;

  @IsEnum(AuditActionType) actionType!: AuditActionType;
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string | null;

  @IsString() actorUserId!: string;
  @IsString() actorName!: string;

  // any JSON allowed
  beforeJson?: unknown | null;
  afterJson?: unknown | null;
  metadata?: Record<string, unknown> | null;
}

export class ListAuditLogsDto {
  @IsString() workspaceId!: string;

  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsString() envKey?: string;
  @IsOptional() @IsEnum(AuditActionType) actionType?: AuditActionType;
  @IsOptional() @IsString() entityType?: string;
  @IsOptional() @IsString() actorUserId?: string;
  @IsOptional() @IsString() search?: string;

  @IsOptional() limit?: number;
  @IsOptional() cursor?: string | null;
  @IsOptional() direction?: 'forward' | 'backward';
}
