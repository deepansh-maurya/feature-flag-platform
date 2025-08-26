import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkspacesmoduleService } from '../application/use-cases/workspacesmodule.service';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  ArchiveWorkspaceDto,
  RestoreWorkspaceDto,
  ListMyWorkspacesDto,
  AddMemberDto,
  ChangeMemberRoleDto,
  TransferOwnershipDto,
  InviteMemberDto,
  AcceptInviteDto,
} from '../interface/dto/create-workspacesmodule.dto';
import { JwtAuthGuard } from 'src/authmodule/infrastructure/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)   
@Controller('workspaces')
export class WorkspacesmoduleController {
  constructor(private readonly svc: WorkspacesmoduleService) {}

  // ------------------------
  // Workspace CRUD
  // ------------------------

  @Post()
  async create(@Body() dto: CreateWorkspaceDto) {
    return this.svc.createWorkspace(dto);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.getWorkspace({ id });
  }

  // Also support GET by slug if you want:
  @Get('by-slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.svc.getWorkspace({ slug });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateWorkspaceDto) {
    return this.svc.updateWorkspace({ ...dto, workspaceId: id });
  }

  @Delete(':id')
  async archive(@Param('id') id: string, @Body() dto: ArchiveWorkspaceDto) {
    return this.svc.archiveWorkspace({ ...dto, workspaceId: id });
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string, @Body() _dto: RestoreWorkspaceDto) {
    return this.svc.restoreWorkspace({ workspaceId: id });
  }

  // List workspaces for a user (you can move userId from body to req.user later)
  @Get()
  async mine(@Query() q: { userId: string; cursor?: string; take?: number; order?: 'asc' | 'desc'; includeArchived?: 'true' | 'false' }) {
    const dto: ListMyWorkspacesDto = {
      userId: q.userId,
      includeArchived: q.includeArchived === 'true',
      pagination: {
        cursor: q.cursor ?? null,
        take: q.take ? Number(q.take) : 20,
        order: q.order === 'asc' ? 'asc' : 'desc',
      },
    };
    return this.svc.listMyWorkspaces(dto);
  }

  // ------------------------
  // Membership
  // ------------------------

  @Get(':id/members')
  async listMembers(
    @Param('id') id: string,
    @Query() q: { cursor?: string; take?: number; order?: 'asc' | 'desc' },
  ) {
    return this.svc.listMembers({
      workspaceId: id,
      pagination: {
        cursor: q.cursor ?? null,
        take: q.take ? Number(q.take) : 20,
        order: q.order === 'asc' ? 'asc' : 'desc',
      },
    });
  }

  @Post(':id/members')
  async addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.svc.addMember({ ...dto, workspaceId: id });
  }

  @Patch(':id/members/:userId')
  async changeRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: ChangeMemberRoleDto,
  ) {
    return this.svc.changeMemberRole({ ...dto, workspaceId: id, userId });
  }

  @Delete(':id/members/:userId')
  async removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.svc.removeMember({ workspaceId: id, userId });
  }

  // ------------------------
  // Ownership
  // ------------------------

  @Post(':id/transfer-ownership')
  async transferOwnership(@Param('id') id: string, @Body() dto: TransferOwnershipDto) {
    return this.svc.transferOwnership({ ...dto, workspaceId: id });
  }

  // ------------------------
  // Invites
  // ------------------------

  @Get(':id/invites')
  async listInvites(
    @Param('id') id: string,
    @Query() q: { cursor?: string; take?: number; order?: 'asc' | 'desc' },
  ) {
    return this.svc.listInvites({
      workspaceId: id,
      pagination: {
        cursor: q.cursor ?? null,
        take: q.take ? Number(q.take) : 20,
        order: q.order === 'asc' ? 'asc' : 'desc',
      },
    });
  }

  @Post(':id/invites')
  async createInvite(@Param('id') id: string, @Body() dto: InviteMemberDto) {
    return this.svc.createInvite({ ...dto, workspaceId: id });
  }

  // Accept via token from email link
  @Post('invites/:token/accept')
  async acceptInvite(@Param('token') token: string, @Body() body: { userId: string }) {
    const dto: AcceptInviteDto = { tokenHash: token, userId: body.userId }; // hash in service if not pre-hashed
    return this.svc.acceptInvite(dto);
  }

  @Delete(':id/invites/:inviteId')
  async revokeInvite(@Param('id') id: string, @Param('inviteId') inviteId: string) {
    return this.svc.revokeInvite({ workspaceId: id, inviteId });
  }

  // ------------------------
  // Limits / Usage
  // ------------------------

  @Get(':id/limits')
  async getLimits(@Param('id') id: string) {
    return this.svc.getPlanLimits({ workspaceId: id });
  }

  @Get(':id/usage')
  async getUsage(@Param('id') id: string) {
    return this.svc.getUsageCounts({ workspaceId: id });
  }

  @Get(':id/check-limit')
  async checkLimit(
    @Param('id') id: string,
    @Query() q: { kind: string; delta?: string },
  ) {
    return this.svc.checkLimit({
      workspaceId: id,
      kind: q.kind as any,
      delta: q.delta ? Number(q.delta) : 1,
    });
  }
}
