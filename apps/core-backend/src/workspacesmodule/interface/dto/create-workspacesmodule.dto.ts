import { IsString, IsOptional, IsUUID, IsEmail, IsEnum, IsNumber, IsBoolean, IsDateString } from "class-validator";
import { Type } from "class-transformer";
import { LimitKind, WorkspaceRole } from "src/workspacesmodule/application/ports/workspacesmodule.repo";
import { BillingStatus } from "generated/prisma";

// ---------- Generic DTOs ----------
export class PaginationDto {
  @IsOptional()
  @IsNumber()
  take?: number = 20;

  @IsOptional()
  @IsString()
  cursor?: string | null;

  @IsOptional()
  @IsString()
  order?: "asc" | "desc" = "desc";
}

export class ByWorkspaceDto {
  @IsUUID()
  workspaceId!: string;
}

export class ByWorkspaceAndUserDto extends ByWorkspaceDto {
  @IsUUID()
  userId!: string;
}

// ---------- Workspace DTOs ----------
export class CreateWorkspaceDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsUUID()
  ownerUserId!: string;

  @IsOptional()
  @IsString()
  planKey?: string = "default";

  @IsOptional()
  @IsString()
  stripeCustomerId?: string;
}

export class UpdateWorkspaceDto extends ByWorkspaceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  planKey?: string;

  @IsOptional()
  @IsEnum(BillingStatus)
  billingStatus?: BillingStatus;
}

export class ArchiveWorkspaceDto extends ByWorkspaceDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RestoreWorkspaceDto extends ByWorkspaceDto { }

export class GetWorkspaceDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsBoolean()
  includeArchived?: boolean = false;
}

export class ListMyWorkspacesDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @Type(() => PaginationDto)
  pagination?: PaginationDto;

  @IsOptional()
  @IsBoolean()
  includeArchived?: boolean = false;
}

// ---------- Membership DTOs ----------
export class AddMemberDto extends ByWorkspaceDto {
  @IsUUID()
  userId!: string;

  @IsEnum(["ADMIN", "EDITOR", "VIEWER"])
  role!: Exclude<WorkspaceRole, "OWNER">;
}

export class ChangeMemberRoleDto extends ByWorkspaceDto {
  @IsUUID()
  userId!: string;

  @IsEnum(["ADMIN", "EDITOR", "VIEWER"])
  role!: Exclude<WorkspaceRole, "OWNER">;
}

export class RemoveMemberDto extends ByWorkspaceDto {
  @IsUUID()
  userId!: string;
}

export class GetMemberRoleDto extends ByWorkspaceAndUserDto { }

// ---------- Ownership DTOs ----------
export class TransferOwnershipDto extends ByWorkspaceDto {
  @IsUUID()
  fromUserId!: string;

  @IsUUID()
  toUserId!: string;
}

// ---------- Invite DTOs ----------
export class InviteMemberDto extends ByWorkspaceDto {
  @IsEmail()
  email!: string;

  @IsEnum(["ADMIN", "EDITOR", "VIEWER"])
  role!: Exclude<WorkspaceRole, "OWNER">;

  @IsString()
  tokenHash!: string;

  @IsUUID()
  invitedByUserId!: string;

  @IsDateString()
  expiresAt!: Date;
}

export class AcceptInviteDto {
  @IsString()
  tokenHash!: string;

  @IsUUID()
  userId!: string;
}

export class RevokeInviteDto extends ByWorkspaceDto {
  @IsUUID()
  inviteId!: string;
}

// ---------- Limits / Usage DTOs ----------
export class CheckLimitDto extends ByWorkspaceDto {
  @IsEnum(LimitKind)
  kind!: LimitKind;

  @IsOptional()
  @IsNumber()
  delta?: number = 1;
}

export class GetUsageCountsDto extends ByWorkspaceDto { }
