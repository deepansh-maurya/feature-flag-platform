// application/ports/workspacesmodule.repo.ts
import { WorkspaceEntity } from "src/workspacesmodule/domain/workspacesmodule.entity";
import { AcceptInviteDto, AddMemberDto, ArchiveWorkspaceDto, ByWorkspaceDto, ChangeMemberRoleDto, CheckLimitDto, CreateWorkspaceDto, GetMemberRoleDto, GetUsageCountsDto, GetWorkspaceDto, InviteMemberDto, ListMyWorkspacesDto, PaginationDto, RemoveMemberDto, RestoreWorkspaceDto, RevokeInviteDto, TransferOwnershipDto, UpdateWorkspaceDto } from "src/workspacesmodule/interface/dto/create-workspacesmodule.dto";

export const WorkspacesmoduleRepoToken = Symbol("WorkspacesmoduleRepo");

// ---------- Roles / Enums ----------
export type WorkspaceRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
export const BillingStatus = {
  ACTIVE: "active",
  PAST_DUE: "past_due",
  CANCELED: "canceled",
  TRIALING: "trialing",
  INCOMPLETE: "incomplete",
} as const;

export type BillingStatus = (typeof BillingStatus)[keyof typeof BillingStatus];


export const LimitKind = {
  MEMBERS: "members",
  PROJECTS: "projects",
  ENVIRONMENTS: "environments",
  FLAGS: "flags",
  SEGMENTS: "segments",
  API_TOKENS: "apiTokens",
  WEBHOOKS: "webhooks",
} as const;

export type LimitKind = (typeof LimitKind)[keyof typeof LimitKind];

// ---------- Outputs ----------
export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  planKey: string;
  billingStatus: BillingStatus;
  ownerUserId: string;
  createdAt: Date;
  updatedAt: Date;
  archived?: boolean;
}

export interface MemberSummary {
  userId: string;
  role: WorkspaceRole;
  joinedAt: Date;
}

export interface InviteSummary {
  id: string;
  email: string;
  role: Exclude<WorkspaceRole, "OWNER">;
  invitedByUserId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface UsageCounts {
  members: number;
  projects: number;
  environments: number;
  flags: number;
  segments: number;
  apiTokens: number;
  webhooks: number;
}
// extend your PlanLimits to include booleans & retention
export type FeatureGate = "experiments" | "advancedRules" | "integrations" | "rbac" | "sso";
export interface PlanLimits {
  // hard limits
  workspaces: number | "unlimited"; 
  projects: number | "unlimited";
  environmentsPerWorkspace: number | "unlimited";
  seats: number | "unlimited";
  flags: number | "unlimited";
  segments: number | "unlimited";
  apiRequestsPerMonth: number | "custom" | "unlimited";
  webhooks: number | "unlimited";

  // retention
  auditRetentionDays: number | "unlimited";

  // feature toggles
  features: Record<FeatureGate, boolean | "advanced">;
}

// Optional transactional context; implement using Prisma $transaction inside infra
export interface TxHandle { /* opaque to application layer */ }

// ---------- Repo Port ----------
export interface WorkspacesmoduleRepo {
  // Workspaces
  create(dto: CreateWorkspaceDto): Promise<WorkspaceEntity>;
  get(dto: GetWorkspaceDto): Promise<WorkspaceEntity | null>;
  update(dto: UpdateWorkspaceDto): Promise<void>;
  archive(dto: ArchiveWorkspaceDto): Promise<void>;
  restore(dto: RestoreWorkspaceDto): Promise<void>;
  listMine(dto: ListMyWorkspacesDto): Promise<{ items: WorkspaceSummary[]; nextCursor: string | null }>;

  // Membership
  addMember(dto: AddMemberDto): Promise<void>;
  changeMemberRole(dto: ChangeMemberRoleDto): Promise<void>;
  removeMember(dto: RemoveMemberDto): Promise<void>;
  getMemberRole(dto: GetMemberRoleDto): Promise<WorkspaceRole | null>;
  listMembers(dto: ByWorkspaceDto & { pagination?: PaginationDto }): Promise<{ items: MemberSummary[]; nextCursor: string | null }>;

  // Ownership
  transferOwnership(dto: TransferOwnershipDto): Promise<void>;

  // Invites
  createInvite(dto: InviteMemberDto): Promise<InviteSummary>;
  acceptInvite(dto: AcceptInviteDto): Promise<{ workspaceId: string; role: Exclude<WorkspaceRole, "OWNER"> } | null>;
  revokeInvite(dto: RevokeInviteDto): Promise<void>;
  listInvites(dto: ByWorkspaceDto & { pagination?: PaginationDto }): Promise<{ items: InviteSummary[]; nextCursor: string | null }>;

  // Limits / Usage
  getPlanLimits(dto: ByWorkspaceDto): Promise<PlanLimits>;          // usually from Billing/plan lookup table
  getUsageCounts(dto: GetUsageCountsDto): Promise<UsageCounts>;     // computed counts
  checkLimit(dto: CheckLimitDto): Promise<{ allowed: boolean; limit: number; used: number }>;

  // Utility
  ensureUniqueSlug(slug: string): Promise<string>;                  // returns same slug or postfixed unique
  // Transaction boundary (optional)
  runInTransaction<T>(fn: (tx: WorkspacesmoduleRepo) => Promise<T>): Promise<T>;
}
