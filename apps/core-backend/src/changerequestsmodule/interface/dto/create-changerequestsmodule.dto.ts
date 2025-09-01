import { IsUUID, IsString, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { ChangeRequestStatus } from '@prisma/client'

/* ---------- Inputs ---------- */

export class CreateChangeRequestDto {
  @IsUUID() flagId: string;
  @IsUUID() workspaceId: string;

  @IsString() envKey: string;

  @IsOptional() @IsInt() @Min(0)
  fromVersion?: number;

  @IsInt() @Min(1)
  toVersion: number;

  @IsString()
  createdBy: string;

  @IsOptional() @IsString()
  comment?: string;
}

export class ApproveChangeRequestDto {
  @IsUUID() id: string;
  @IsString() reviewerId: string;
  @IsOptional() @IsString()
  comment?: string;
}

export class RejectChangeRequestDto {
  @IsUUID() id: string;
  @IsString() reviewerId: string;
  @IsOptional() @IsString()
  comment?: string;
}

export class MarkAppliedChangeRequestDto {
  @IsUUID() id: string;
}

export class GetByFlagEnvDto {
  @IsUUID() flagId: string;
  @IsString() envKey: string;

  @IsOptional() @IsEnum(ChangeRequestStatus)
  status?: ChangeRequestStatus;
}

/* ---------- Outputs ---------- */

export class ChangeRequestDto {
  id: string;
  flagId: string;
  workspaceId: string;
  envKey: string;
  fromVersion?: number | null;
  toVersion: number;
  status: ChangeRequestStatus;
  createdBy: string;
  reviewerId?: string | null;
  comment?: string | null;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
