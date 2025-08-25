// infrastructure/prisma/prisma-workspacesmodule.repo.ts
import { Injectable, BadRequestException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RoleKey } from 'generated/prisma';
import PrismaService from 'src/infra/prisma/prisma.service';
import { BillingStatus, InviteSummary, MemberSummary, PlanLimits, UsageCounts, WorkspaceRole, WorkspacesmoduleRepo, WorkspaceSummary } from 'src/workspacesmodule/application/ports/workspacesmodule.repo';
import { WorkspaceEntity } from 'src/workspacesmodule/domain/workspacesmodule.entity';
import { AcceptInviteDto, AddMemberDto, ArchiveWorkspaceDto, ChangeMemberRoleDto, CheckLimitDto, CreateWorkspaceDto, GetMemberRoleDto, GetWorkspaceDto, InviteMemberDto, ListMyWorkspacesDto, PaginationDto, RemoveMemberDto, RestoreWorkspaceDto, RevokeInviteDto, TransferOwnershipDto, UpdateWorkspaceDto } from 'src/workspacesmodule/interface/dto/create-workspacesmodule.dto';

//TODO add plan key where the any is written 
//Todo move the plans in db 

export const PLAN_LIMITS: Record<any, PlanLimits> = {
  starter: {
    workspaces: 1,
    projects: 3,
    environmentsPerWorkspace: 2,   // dev/stage/prod = 3? Your table shows "2/env": interpret as 2 per WS; adjust if needed
    seats: 5,
    flags: 50,
    segments: 0, // "Basic rules" → no segments
    apiRequestsPerMonth: 1_000_000,
    webhooks: 0,
    auditRetentionDays: 7,
    features: {
      experiments: false,
      advancedRules: false,          // only basic rules
      integrations: false,           // limited → false for now
      rbac: false,
      sso: false,
    },
  },
  growth: {
    workspaces: 3,
    projects: 10,
    environmentsPerWorkspace: 5,
    seats: 20,
    flags: 500,
    segments: 100,                   // “Advanced (segments, % rollout)”
    apiRequestsPerMonth: 10_000_000,
    webhooks: 5,
    auditRetentionDays: 90,
    features: {
      experiments: true,
      advancedRules: true,           // segments + % rollout
      integrations: true,            // Slack/Jira etc.
      rbac: false,
      sso: false,
    },
  },
  enterprise: {
    workspaces: "unlimited",
    projects: "unlimited",
    environmentsPerWorkspace: "unlimited",
    seats: "unlimited",
    flags: "unlimited",
    segments: "unlimited",
    apiRequestsPerMonth: "custom",   // negotiated in contract
    webhooks: "unlimited",
    auditRetentionDays: "unlimited",
    features: {
      experiments: "advanced",       // advanced reporting
      advancedRules: true,           // nested rules, custom attrs
      integrations: true,            // SSO, custom webhooks
      rbac: true,
      sso: true,
    },
  },
};


@Injectable()
export class PrismaWorkspacesmoduleRepo implements WorkspacesmoduleRepo {
  constructor(private readonly prisma: PrismaService) { }

  // --------------------------
  // Helpers
  // --------------------------
  private toEntity(row: any): WorkspaceEntity {
    return new WorkspaceEntity({
      id: row.id,
      name: row.name,
      slug: row.slug,
      ownerUserId: row.ownerUserId,
      planKey: row.planKey,
      billingStatus: row.billingStatus,
      stripeCustomerId: row.stripeCustomerId ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      archived: !!row.archivedAt,
    });
  }

  private toSummary(row: any): WorkspaceSummary {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      planKey: row.planKey,
      billingStatus: row.billingStatus as BillingStatus,
      ownerUserId: row.ownerUserId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      archived: !!row.archivedAt,
    };
  }

  private slugify(input: string) {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async ensureUniqueSlug(base: string): Promise<string> {
    let slug = this.slugify(base);
    if (!slug) slug = 'workspace';
    let suffix = 0;

    // Try slug, slug-2, slug-3 ...
    // Use findUnique on slug since it’s unique
    while (true) {
      const exists = await this.prisma.workspace.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!exists) return slug;
      suffix += 1;
      slug = `${slug.replace(/-\d+$/, '')}-${suffix + 1}`;
    }
  }

  // --- helper to map a row to summary
  private toMemberSummary(row: any): MemberSummary {
    return {
      userId: row.userId,
      role: row.role as WorkspaceRole,
      joinedAt: row.createdAt,
    };
  }


  private toInviteSummary(row: any): InviteSummary {
    return {
      id: row.id,
      email: row.email,
      role: row.roleKey.toUpperCase() as Exclude<WorkspaceRole, "OWNER">,
      invitedByUserId: row.invitedByUserId ?? "",   // if you added invitedByUserId
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    };
  }

  // --------------------------
  // Methods
  // --------------------------

  async create(dto: CreateWorkspaceDto): Promise<WorkspaceEntity> {
    const slug = dto.slug ? this.slugify(dto.slug) : await this.ensureUniqueSlug(dto.name);
    const finalSlug = dto.slug ? await this.ensureUniqueSlug(slug) : slug;

    const row = await this.prisma.workspace.create({
      data: {
        name: dto.name,
        slug: finalSlug,
        ownerUserId: dto.ownerUserId,
        planKey: dto.planKey ?? 'free',
        stripeCustomerId: dto.stripeCustomerId ?? '',
        billingStatus: 'active', // default per your schema
      },
    });

    // Also ensure owner is a member (OWNER role) if you keep a members table
    // Optional — uncomment if you have WorkspaceMember model and want invariant.
    // await this.prisma.workspaceMember.create({
    //   data: { workspaceId: row.id, userId: dto.ownerUserId, role: 'OWNER' }
    // });

    return this.toEntity(row);
  }

  async get(dto: GetWorkspaceDto): Promise<WorkspaceEntity | null> {
    if (!dto.id && !dto.slug) throw new BadRequestException('id or slug required');

    const row = await this.prisma.workspace.findFirst({
      where: {
        ...(dto.id ? { id: dto.id } : {}),
        ...(dto.slug ? { slug: dto.slug } : {}),
        ...(dto.includeArchived ? {} : { archivedAt: null }),
      },
    });

    return row ? this.toEntity(row) : null;
  }

  async update(dto: UpdateWorkspaceDto): Promise<void> {
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.planKey !== undefined) data.planKey = dto.planKey;
    if (dto.billingStatus !== undefined) data.billingStatus = dto.billingStatus as any;
    if (dto.slug !== undefined) {
      const desired = this.slugify(dto.slug);
      data.slug = await this.ensureUniqueSlug(desired);
    }

    await this.prisma.workspace.update({
      where: { id: dto.workspaceId },
      data,
    });
  }

  async archive(dto: ArchiveWorkspaceDto): Promise<void> {
    // Soft delete via archivedAt
    await this.prisma.workspace.update({
      where: { id: dto.workspaceId },
      data: { archivedAt: new Date() },
    });

    // Optionally: write an audit log using your AuditLog model here
  }

  async restore(dto: RestoreWorkspaceDto): Promise<void> {
    await this.prisma.workspace.update({
      where: { id: dto.workspaceId },
      data: { archivedAt: null },
    });
  }

  async listMine(dto: ListMyWorkspacesDto): Promise<{ items: WorkspaceSummary[]; nextCursor: string | null }> {
    const take = dto.pagination?.take ?? 20;
    const order = dto.pagination?.order === 'asc' ? 'asc' : 'desc';
    const cursor = dto.pagination?.cursor ?? null;

    // Join through membership; assume you have WorkspaceMember model with (workspaceId, userId)
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId: dto.userId },
      select: { workspaceId: true },
    });

    const wsIds = memberships.map((m) => m.workspaceId);
    if (wsIds.length === 0) {
      return { items: [], nextCursor: null };
    }

    const rows = await this.prisma.workspace.findMany({
      where: {
        id: { in: wsIds },
        ...(dto.includeArchived ? {} : { archivedAt: null }),
      },
      orderBy: { createdAt: order },
      take,
      ...(cursor
        ? {
          skip: 1,
          cursor: { id: cursor },
        }
        : {}),
      select: {
        id: true,
        name: true,
        slug: true,
        planKey: true,
        billingStatus: true,
        ownerUserId: true,
        createdAt: true,
        updatedAt: true,
        archivedAt: true,
      },
    });

    const items = rows.map((r) => this.toSummary(r));
    const nextCursor = rows.length === take ? rows[rows.length - 1].id : null;

    return { items, nextCursor };
  }

  // If your port also has ensureUniqueSlug exposed:
  async ensureUniqueSlugPublic(slug: string): Promise<string> {
    return this.ensureUniqueSlug(slug);
  }

  // If your port defines runInTransaction, you can add:
  async runInTransaction<T>(fn: (tx: WorkspacesmoduleRepo) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (prisma) => {
      const child = new PrismaWorkspacesmoduleRepo(prisma as any);
      return fn(child as any);
    });
  }

  // Membership 

  async addMember(dto: AddMemberDto): Promise<void> {
    // Expect a UNIQUE index on (workspaceId, userId)
    try {
      await this.prisma.workspaceMember.create({
        data: {
          workspaceId: dto.workspaceId,
          userId: dto.userId,
          roleKey: dto.role as any, // 'ADMIN' | 'EDITOR' | 'VIEWER'
        },
        select: { id: true },
      });
    } catch (e: any) {
      // Prisma P2002 = unique constraint failed
      if (e.code === 'P2002') {
        throw new ConflictException('User is already a member of this workspace');
      }
      throw e;
    }
  }

  async changeMemberRole(dto: ChangeMemberRoleDto): Promise<void> {
    // NOTE: OWNER promotion/demotion should be handled in service via transferOwnership
    const updated = await this.prisma.workspaceMember.updateMany({
      where: { workspaceId: dto.workspaceId, userId: dto.userId },
      data: { roleKey: dto.role as any },
    });
    if (updated.count === 0) {
      throw new NotFoundException('Membership not found');
    }
  }

  async removeMember(dto: RemoveMemberDto): Promise<void> {
    // Service layer should block removing OWNER / self-removal rules, etc.
    const deleted = await this.prisma.workspaceMember.deleteMany({
      where: { workspaceId: dto.workspaceId, userId: dto.userId },
    });
    if (deleted.count === 0) {
      throw new NotFoundException('Membership not found');
    }
  }

  async getMemberRole(dto: GetMemberRoleDto): Promise<WorkspaceRole | null> {
    const m = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: dto.workspaceId,
          userId: dto.userId,
        },
      },
      select: { roleKey: true },
    });
    return m ? (m.roleKey as WorkspaceRole) : null;
  }

  async listMembers(dto: { workspaceId: string; pagination?: PaginationDto }): Promise<{ items: MemberSummary[]; nextCursor: string | null }> {
    const take = dto.pagination?.take ?? 20;
    const order = dto.pagination?.order === 'asc' ? 'asc' : 'desc';
    const cursor = dto.pagination?.cursor ?? null;

    const rows = await this.prisma.workspaceMember.findMany({
      where: { workspaceId: dto.workspaceId },
      orderBy: { createdAt: order },
      take,
      ...(cursor
        ? {
          skip: 1,
          cursor: { id: cursor }, // assumes `id` on WorkspaceMember
        }
        : {}),
      select: {
        id: true,
        userId: true,
        roleKey: true,
        createdAt: true,
      },
    });

    const items = rows.map((r) => this.toMemberSummary(r));
    const nextCursor = rows.length === take ? rows[rows.length - 1].id : null;

    return { items, nextCursor };
  }

  // Ownership
  async transferOwnership(dto: TransferOwnershipDto): Promise<void> {
    const { workspaceId, fromUserId, toUserId } = dto;
    if (fromUserId === toUserId) {
      throw new BadRequestException('fromUserId and toUserId cannot be the same');
    }

    await this.prisma.$transaction(async (tx) => {
      // 1) Load workspace and verify current owner
      const ws = await tx.workspace.findUnique({
        where: { id: workspaceId },
        select: { id: true, ownerUserId: true },
      });
      if (!ws) throw new NotFoundException('Workspace not found');
      if (ws.ownerUserId !== fromUserId) {
        throw new ForbiddenException('Only the current owner can transfer ownership');
      }

      // 2) Ensure target user is (or becomes) a member
      const targetMembership = await tx.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: toUserId } },
        select: { id: true, roleKey: true },
      });

      if (!targetMembership) {
        // If not a member yet, add as admin first (role will be switched to owner below)
        await tx.workspaceMember.create({
          data: { workspaceId, userId: toUserId, roleKey: 'admin' as RoleKey },
        });
      }

      // 3) Ensure the current owner has a membership row (upsert), then demote
      await tx.workspaceMember.upsert({
        where: { workspaceId_userId: { workspaceId, userId: fromUserId } },
        create: { workspaceId, userId: fromUserId, roleKey: 'owner' as RoleKey },
        update: {}, // no-op if exists
      });

      // 4) Promote target to OWNER role
      await tx.workspaceMember.update({
        where: { workspaceId_userId: { workspaceId, userId: toUserId } },
        data: { roleKey: 'owner' as RoleKey },
      });

      // 5) Demote previous owner to ADMIN (or whatever you choose)
      await tx.workspaceMember.update({
        where: { workspaceId_userId: { workspaceId, userId: fromUserId } },
        data: { roleKey: 'admin' as RoleKey },
      });

      // 6) Update the Workspace.ownerUserId
      await tx.workspace.update({
        where: { id: workspaceId },
        data: { ownerUserId: toUserId },
      });

      // (Optional) 7) Enforce invariant: exactly one OWNER in this workspace
      // If you want to be extra safe, flip any accidental owner roles:
      await tx.workspaceMember.updateMany({
        where: { workspaceId, userId: { not: toUserId }, roleKey: 'owner' as RoleKey },
        data: { roleKey: 'admin' as RoleKey },
      });

      // (Optional) 8) Write an audit log here if you have AuditLog:
      // await tx.auditLog.create({ data: { ... } });
    });
  }


  // =============================
  // Invites
  // =============================

  async createInvite(dto: InviteMemberDto): Promise<InviteSummary> {
    // Prevent inviting OWNER via invites
    // (Service already restricts, but we double-guard here)
    // dto.role is Exclude<WorkspaceRole, 'OWNER'> by type, so it’s safe.

    // Optional: prevent duplicate active invite for same (workspaceId, email)
    const now = new Date();
    const existing = await this.prisma.invite.findFirst({
      where: {
        workspaceId: dto.workspaceId,
        email: dto.email.toLowerCase(),
        expiresAt: { gt: now },
      },
      select: { id: true, expiresAt: true },
    });
    if (existing) {
      throw new ConflictException('An active invite already exists for this email');
    }

    const row = await this.prisma.invite.create({
      data: {
        workspaceId: dto.workspaceId,
        email: dto.email.toLowerCase(),
        roleKey: dto.role as RoleKey,          // 'admin' | 'editor' | 'viewer'
        tokenHash: dto.tokenHash,                   // store only hash
        invitedByUserId: dto.invitedByUserId,
        expiresAt: dto.expiresAt,
      },
      select: {
        id: true,
        email: true,
        roleKey: true,
        invitedByUserId: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return this.toInviteSummary(row);
  }

  async acceptInvite(
    dto: AcceptInviteDto
  ): Promise<{ workspaceId: string; role: Exclude<WorkspaceRole, 'OWNER'> } | null> {
    const now = new Date();

    // Find a valid (not expired) invite by tokenHash
    const invite = await this.prisma.invite.findFirst({
      where: {
        tokenHash: dto.tokenHash,
        expiresAt: { gt: now },
      },
      select: {
        id: true,
        workspaceId: true,
        roleKey: true,
        email: true,
      },
    });

    if (!invite) return null;

    // (Optional) You can mark invite as consumed or delete it.
    // Here we'll delete it so the token can’t be reused.
    await this.prisma.invite.delete({ where: { id: invite.id } });

    // Return the info needed by the service to add membership
    const role = invite.roleKey.toUpperCase() as Exclude<WorkspaceRole, 'OWNER'>;
    return { workspaceId: invite.workspaceId, role };
  }

  async revokeInvite(dto: RevokeInviteDto): Promise<void> {
    // Only revoke invites that belong to the workspace
    const del = await this.prisma.invite.deleteMany({
      where: { id: dto.inviteId, workspaceId: dto.workspaceId },
    });
    if (del.count === 0) {
      throw new NotFoundException('Invite not found');
    }
  }

  async listInvites(dto: { workspaceId: string; pagination?: PaginationDto })
    : Promise<{ items: InviteSummary[]; nextCursor: string | null }> {
    const take = dto.pagination?.take ?? 20;
    const order = dto.pagination?.order === 'asc' ? 'asc' : 'desc';
    const cursor = dto.pagination?.cursor ?? null;

    const rows = await this.prisma.invite.findMany({
      where: { workspaceId: dto.workspaceId },
      orderBy: { createdAt: order },
      take,
      ...(cursor
        ? {
          skip: 1,
          cursor: { id: cursor },
        }
        : {}),
      select: {
        id: true,
        email: true,
        roleKey: true,
        invitedByUserId: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    const items = rows.map((r) => this.toInviteSummary(r));
    const nextCursor = rows.length === take ? rows[rows.length - 1].id : null;

    return { items, nextCursor };
  }



  private async getCurrentPlanKey(workspaceId: string): Promise<any> {
    const now = new Date();
    // prefer an active/trialing subscription in current period
    const sub = await this.prisma.subscription.findFirst({
      where: {
        workspaceId,
        status: { in: ["active", "trialing"] },
        periodStart: { lte: now },
        periodEnd: { gt: now },
        cancelAtPeriodEnd: false,
      },
      orderBy: { createdAt: "desc" },
      select: { planKey: true },
    });

    if (sub) return sub.planKey as any;

    // fallback to workspace.planKey (default “free/starter” in your schema)
    const ws = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { planKey: true },
    });
    if (!ws) throw new NotFoundException("Workspace not found");
    return ws.planKey as any;
  }

  async getPlanLimits(dto: { workspaceId: string }): Promise<any> {
    const planKey = await this.getCurrentPlanKey(dto.workspaceId);
    return PLAN_LIMITS[planKey] ?? PLAN_LIMITS.starter;
  }


  async getUsageCounts(dto: { workspaceId: string }): Promise<UsageCounts> {
    const { workspaceId } = dto;

    const [
      members,
      projects,
      environments,
      flags,
      segments,
      apiTokens,
      webhooks,
    ] = await this.prisma.$transaction([
      this.prisma.workspaceMember.count({ where: { workspaceId } }),
      this.prisma.project.count({ where: { workspaceId } }),
      this.prisma.environment.count({ where: { workspaceId } }),
      this.prisma.flag.count({ where: { workspaceId } }),
      this.prisma.segment.count({ where: { workspaceId } }),
      this.prisma.apiToken.count({ where: { workspaceId } }),
      this.prisma.webhookEndpoint.count({ where: { workspaceId } }),
    ]);

    return { members, projects, environments, flags, segments, apiTokens, webhooks };
  }

  async checkLimit(dto: CheckLimitDto): Promise<{ allowed: boolean; limit: number; used: number }> {
    const limits = await this.getPlanLimits({ workspaceId: dto.workspaceId });
    const usage = await this.getUsageCounts({ workspaceId: dto.workspaceId });

    const delta = dto.delta ?? 1;

    // map kind -> {limit, used}
    const read = (k: keyof PlanLimits, usedCount: number) => {
      const lim = limits[k];
      if (lim === "unlimited" || lim === "custom") {
        return { allowed: true, limit: Number.POSITIVE_INFINITY, used: usedCount };
      }
      return { allowed: usedCount + delta <= (lim as number), limit: lim as number, used: usedCount };
    };

    switch (dto.kind) {
      case "members":
        return read("seats", usage.members);
      case "projects":
        return read("projects", usage.projects);
      case "environments":
        return read("environmentsPerWorkspace", usage.environments);
      case "flags":
        return read("flags", usage.flags);
      case "segments":
        return read("segments", usage.segments);
      // case "apiTokens":
      //   return read("apiTokens", usage.apiTokens);
      case "webhooks":
        return read("webhooks", usage.webhooks);
      default:
        // never here if dto.kind is validated
        return { allowed: false, limit: 0, used: 0 };
    }
  }
}
