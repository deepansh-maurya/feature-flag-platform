import { Injectable } from '@nestjs/common';
import PrismaService from 'src/infra/prisma/prisma.service';
import { ProjectmoduleRepo } from '../../application/ports/projectmodule.repo';
import {
  AddEnvironmentDto,
  CreateProjectDto,
  EnvironmentDto,
  IssueSdkKeyDto,
  ListProjectsResultDto,
  ProjectSummaryDto,
  RevokeSdkKeyDto,
  RotateSdkKeyDto,
  SdkKeyDto,
  UpdateProjectDto,
} from '../../interface/dto/create-projectmodule.dto';
import { KeyStatus, SdkKeyType } from 'generated/prisma';

@Injectable()
export class PrismaProjectmoduleRepo implements ProjectmoduleRepo {
  constructor(private readonly prisma: PrismaService) {}

  /* ========================= Projects ========================= */

  async createProject(input: CreateProjectDto): Promise<ProjectSummaryDto> {
    const { workspaceId, name, guardrails, langSupport, timeZone } = input;


    const p = await this.prisma.project.create({
      data: {
        workspaceId,
        name,
        //@ts-ignore
        rolloutPollicies: guardrails,
        //@ts-ignore
        langSupport: langSupport,
        timeZone: timeZone,
      },
    });

    return this.toProjectSummaryDto(p);
  }

  async findProjectById(id: string): Promise<ProjectSummaryDto | null> {
    const p = await this.prisma.project.findUnique({ where: { id } });
    return p ? this.toProjectSummaryDto(p) : null;
  }

  async listProjects(
    workspaceId: string,
    limit: number,
    cursor?: string,
  ): Promise<ListProjectsResultDto> {
    const rows = await this.prisma.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > limit;
    const items = (hasMore ? rows.slice(0, -1) : rows).map(
      this.toProjectSummaryDto,
    );
    return { items, nextCursor: hasMore ? rows[limit].id : null };
  }

  async updateProject(input: UpdateProjectDto): Promise<ProjectSummaryDto> {
    const p = await this.prisma.project.update({
      where: { id: input.id },
      data: {
        ...(input.name ? { name: input.name } : {}),
      },
    });
    return this.toProjectSummaryDto(p);
  }

  /* ======================= Environments ======================= */

  async addEnvironment(input: AddEnvironmentDto): Promise<EnvironmentDto> {
    const env = await this.prisma.environment.create({
      data: {
        projectId: input.projectId,
        workspaceId: input.workspaceId,
        key: input.key,
        displayName: input.displayName,
      },
    });
    return this.toEnvironmentDto(env);
  }

  async listEnvironments(projectId: string): Promise<EnvironmentDto[]> {
    const envs = await this.prisma.environment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
    return envs.map(this.toEnvironmentDto);
  }

  async findEnvironment(
    projectId: string,
    envKey: string,
  ): Promise<EnvironmentDto | null> {
    const env = await this.prisma.environment.findFirst({
      where: { projectId, key: envKey },
    });
    return env ? this.toEnvironmentDto(env) : null;
  }

  /* ========================= SDK Keys ========================= */

  async issueSdkKey(input: IssueSdkKeyDto): Promise<SdkKeyDto> {
    const key = await this.prisma.sdkKey.create({
      data: {
        projectId: input.projectId,
        workspaceId: input.workspaceId,
        envKey: input.envKey,
        type: input.type,
        keyHash: input.keyHash,
        createdBy: input.createdBy,
        status: KeyStatus.active,
      },
    });
    return this.toSdkKeyDto(key);
  }

  async revokeSdkKey(input: RevokeSdkKeyDto): Promise<void> {
    await this.prisma.sdkKey.update({
      where: { id: input.sdkKeyId },
      data: { status: KeyStatus.disabled },
    });
  }

  /**
   * Insert a new active key. If keepOldActive is false (default),
   * immediately disable the previously active key for the same (projectId, envKey, type).
   */
  async rotateSdkKey(
    input: RotateSdkKeyDto,
  ): Promise<{ newKey: SdkKeyDto; oldKey?: SdkKeyDto }> {
    const {
      projectId,
      workspaceId,
      envKey,
      type,
      newKeyHash,
      createdBy,
      keepOldActive,
    } = input;

    const res = await this.prisma.$transaction(async (tx) => {
      const old = await tx.sdkKey.findFirst({
        where: {
          projectId,
          workspaceId,
          envKey,
          type,
          status: KeyStatus.active,
        },
        orderBy: { createdAt: 'desc' },
      });

      const newKey = await tx.sdkKey.create({
        data: {
          projectId,
          workspaceId,
          envKey,
          type,
          keyHash: newKeyHash,
          createdBy,
          status: KeyStatus.active,
          rotatedAt: new Date(),
        },
      });

      let updatedOld = old;
      if (old && !keepOldActive) {
        updatedOld = await tx.sdkKey.update({
          where: { id: old.id },
          data: { status: KeyStatus.disabled, rotatedAt: new Date() },
        });
      }

      return { newKey, oldKey: updatedOld ?? null };
    });

    return {
      newKey: this.toSdkKeyDto(res.newKey),
      oldKey: res.oldKey ? this.toSdkKeyDto(res.oldKey) : undefined,
    };
  }

  async listSdkKeys(
    projectId: string,
    envKey?: string,
    type?: SdkKeyType,
  ): Promise<SdkKeyDto[]> {
    const rows = await this.prisma.sdkKey.findMany({
      where: {
        projectId,
        ...(envKey ? { envKey } : {}),
        ...(type ? { type } : {}),
      },
      orderBy: [{ envKey: 'asc' }, { type: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map(this.toSdkKeyDto);
  }

  /* ========================= Mappers ========================= */

  private toProjectSummaryDto = (p: any): ProjectSummaryDto => ({
    id: p.id,
    workspaceId: p.workspaceId,
    name: p.name,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  });

  private toEnvironmentDto = (e: any): EnvironmentDto => ({
    id: e.id,
    projectId: e.projectId,
    key: e.key,
    displayName: e.displayName,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  });

  private toSdkKeyDto = (k: any): SdkKeyDto => ({
    id: k.id,
    projectId: k.projectId,
    workspaceId: k.workspaceId,
    envKey: k.envKey,
    type: k.type,
    status: k.status,
    lastUsedAt: k.lastUsedAt ?? null,
    rotatedAt: k.rotatedAt ?? null,
    createdBy: k.createdBy,
    createdAt: k.createdAt,
    updatedAt: k.updatedAt,
  });
}
