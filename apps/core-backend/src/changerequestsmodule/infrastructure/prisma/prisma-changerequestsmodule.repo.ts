import { Injectable } from '@nestjs/common';
import PrismaService from 'src/infra/prisma/prisma.service';
import {
  ChangeRequestRepo,
} from '../../application/ports/changerequestsmodule.repo';
import {
  ApproveChangeRequestDto,
  ChangeRequestDto,
  CreateChangeRequestDto,
  GetByFlagEnvDto,
  MarkAppliedChangeRequestDto,
  RejectChangeRequestDto,
} from '../../interface/dto/create-changerequestsmodule.dto';
import { ChangeRequestStatus } from 'generated/prisma';

@Injectable()
export class PrismaChangeRequestRepository implements ChangeRequestRepo {
  constructor(private readonly prisma: PrismaService) {}

  /* ---------------------------- reads ---------------------------- */

  async findById(id: string): Promise<ChangeRequestDto | null> {
    const row = await this.prisma.changeRequest.findUnique({ where: { id } });
    return row ? this.toDto(row) : null;
  }

  async listByFlagEnv(input: GetByFlagEnvDto): Promise<ChangeRequestDto[]> {
    const rows = await this.prisma.changeRequest.findMany({
      where: {
        flagId: input.flagId,
        envKey: input.envKey,
        ...(input.status ? { status: input.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(this.toDto);
  }

  async listOpenByEnv(flagId: string, envKey: string): Promise<ChangeRequestDto[]> {
    const rows = await this.prisma.changeRequest.findMany({
      where: { flagId, envKey, status: ChangeRequestStatus.open },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(this.toDto);
  }

  /* --------------------------- writes --------------------------- */

  async create(input: CreateChangeRequestDto): Promise<ChangeRequestDto> {
    // Optional guard: ensure there isn't already an open request to same toVersion
    // (skip if you allow multiple)
    const row = await this.prisma.changeRequest.create({
      data: {
        flagId: input.flagId,
        workspaceId: input.workspaceId,
        envKey: input.envKey,
        fromVersion: input.fromVersion ?? null,
        toVersion: input.toVersion,
        status: ChangeRequestStatus.open,
        createdBy: input.createdBy,
        comment: input.comment ?? null,
      },
    });
    return this.toDto(row);
  }

  async approve(input: ApproveChangeRequestDto): Promise<ChangeRequestDto> {
    const row = await this.prisma.changeRequest.update({
      where: { id: input.id },
      data: {
        status: ChangeRequestStatus.approved,
        reviewerId: input.reviewerId,
        comment: input.comment ?? undefined,
        approvedAt: new Date(),
      },
    });
    return this.toDto(row);
  }

  async reject(input: RejectChangeRequestDto): Promise<ChangeRequestDto> {
    const row = await this.prisma.changeRequest.update({
      where: { id: input.id },
      data: {
        status: ChangeRequestStatus.rejected,
        reviewerId: input.reviewerId,
        comment: input.comment ?? undefined,
        approvedAt: new Date(), // keep reviewer + timestamp for audit trail
      },
    });
    return this.toDto(row);
  }

  async markApplied(input: MarkAppliedChangeRequestDto): Promise<ChangeRequestDto> {
    const row = await this.prisma.changeRequest.update({
      where: { id: input.id },
      data: {
        status: ChangeRequestStatus.applied,
      },
    });
    return this.toDto(row);
  }

  /* --------------------------- mapper --------------------------- */

  private toDto = (r: any): ChangeRequestDto => ({
    id: r.id,
    flagId: r.flagId,
    workspaceId: r.workspaceId,
    envKey: r.envKey,
    fromVersion: r.fromVersion ?? null,
    toVersion: r.toVersion,
    status: r.status,
    createdBy: r.createdBy,
    reviewerId: r.reviewerId ?? null,
    comment: r.comment ?? null,
    approvedAt: r.approvedAt ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  });
}
