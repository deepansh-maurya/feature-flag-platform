import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
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
        rolloutPollicies: guardrails as any,
        // DB currently stores langSupport as TEXT (JSON string). stringify here so writes succeed.
        langSupport: Array.isArray(langSupport) ? JSON.stringify(langSupport) : (langSupport as any),
        timeZone: timeZone,
      },
    });

    console.log(p,"project created");
    

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
    const data: any = {};
    if (input.name) data.name = input.name;
    if (input.timeZone) data.timeZone = input.timeZone;
    if (input.guardrails) data.rolloutPollicies = input.guardrails as any;
    if (input.langSupport) {
      // stringify array into JSON to match DB TEXT column
      data.langSupport = Array.isArray(input.langSupport)
        ? JSON.stringify(input.langSupport)
        : input.langSupport as any;
    }

    const p = await this.prisma.project.update({
      where: { id: input.id },
      data,
    });
    return this.toProjectSummaryDto(p);
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await this.prisma.project.delete({ where: { id } });
    } catch (e: any) {
      // Prisma throws an error when record not found; normalize to NotFoundException
      if (e && e.code === 'P2025') {
        throw new NotFoundException('Project not found');
      }
      throw e;
    }
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
    timeZone: p.timeZone,
    rolloutPollicies: p.rolloutPollicies,
    // DB may store langSupport as JSON string (TEXT) or as array (enum[]). Normalize to array for clients.
    langSupport: ((): string[] => {
      try {
        if (Array.isArray(p.langSupport)) return p.langSupport as string[];
        if (typeof p.langSupport === 'string') {
          const parsed = JSON.parse(p.langSupport);
          return Array.isArray(parsed) ? parsed : [String(parsed)];
        }
        return [];
      } catch (e) {
        // malformed JSON -> fallback to splitting by comma
        if (typeof p.langSupport === 'string') return p.langSupport.split(',').map((s: string) => s.trim()).filter(Boolean);
        return [];
      }
    })(),
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
