import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  WorkspacesmoduleRepo,
  WorkspacesmoduleRepoToken,
} from '../ports/workspacesmodule.repo';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  ArchiveWorkspaceDto,
  RestoreWorkspaceDto,
  GetWorkspaceDto,
  ListMyWorkspacesDto,
  AddMemberDto,
  ChangeMemberRoleDto,
  RemoveMemberDto,
  GetMemberRoleDto,
  TransferOwnershipDto,
  InviteMemberDto,
  AcceptInviteDto,
  RevokeInviteDto,
  CheckLimitDto,
  ByWorkspaceDto,
} from '../../interface/dto/create-workspacesmodule.dto';
import { WorkspaceEntity } from '../../domain/workspacesmodule.entity';

@Injectable()
export class WorkspacesmoduleService {
  constructor(
    @Inject(WorkspacesmoduleRepoToken)
    private readonly repo: WorkspacesmoduleRepo,
  ) {}

  // ------------------------
  // Workspace CRUD
  // ------------------------
  async createWorkspace(dto: CreateWorkspaceDto): Promise<WorkspaceEntity> {
    // Could enforce plan limits for "workspaces per user" here
    return this.repo.create(dto);
  }

  async getWorkspace(dto: GetWorkspaceDto): Promise<WorkspaceEntity | null> {
    return this.repo.get(dto);
  }

  async updateWorkspace(dto: UpdateWorkspaceDto): Promise<void> {
    return this.repo.update(dto);
  }

  async archiveWorkspace(dto: ArchiveWorkspaceDto): Promise<void> {
    return this.repo.archive(dto);
  }

  async restoreWorkspace(dto: RestoreWorkspaceDto): Promise<void> {
    return this.repo.restore(dto);
  }

  async listMyWorkspaces(dto: ListMyWorkspacesDto) {
    return this.repo.listMine(dto);
  }

  // ------------------------
  // Membership
  // ------------------------
  async addMember(dto: AddMemberDto): Promise<void> {
    // you could add `await this.checkLimit(...)` before calling repo
    return this.repo.addMember(dto);
  }

  async changeMemberRole(dto: ChangeMemberRoleDto): Promise<void> {
    return this.repo.changeMemberRole(dto);
  }

  async removeMember(dto: RemoveMemberDto): Promise<void> {
    return this.repo.removeMember(dto);
  }

  async getMemberRole(dto: GetMemberRoleDto) {
    return this.repo.getMemberRole(dto);
  }

  async listMembers(dto: ByWorkspaceDto & { pagination?: any }) {
    return this.repo.listMembers(dto);
  }

  // ------------------------
  // Ownership
  // ------------------------
  async transferOwnership(dto: TransferOwnershipDto): Promise<void> {
    // Enforce check that fromUserId is current owner etc.
    return this.repo.transferOwnership(dto);
  }

  // ------------------------
  // Invites
  // ------------------------
  async createInvite(dto: InviteMemberDto) {
    return this.repo.createInvite(dto);
  }

  async acceptInvite(dto: AcceptInviteDto) {
    return this.repo.acceptInvite(dto);
  }

  async revokeInvite(dto: RevokeInviteDto) {
    return this.repo.revokeInvite(dto);
  }

  async listInvites(dto: ByWorkspaceDto & { pagination?: any }) {
    return this.repo.listInvites(dto);
  }

  // ------------------------
  // Limits / Usage
  // ------------------------
  async getPlanLimits(dto: ByWorkspaceDto) {
    return this.repo.getPlanLimits(dto);
  }

  async getUsageCounts(dto: ByWorkspaceDto) {
    return this.repo.getUsageCounts(dto);
  }

  async checkLimit(dto: CheckLimitDto) {
    return this.repo.checkLimit(dto);
  }
}
