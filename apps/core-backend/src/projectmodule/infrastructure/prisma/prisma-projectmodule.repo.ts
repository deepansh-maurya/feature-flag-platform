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
        rolloutPollicies: guardrails,
        // DB currently stores langSupport as TEXT (JSON string). stringify here so writes succeed.
        langSupport: Array.isArray(langSupport)
          ? JSON.stringify(langSupport)
          : (langSupport as any),
        timeZone: timeZone,
      },
    });

    console.log(p, 'project created');

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
    if (input.guardrails) data.rolloutPollicies = input.guardrails;
    if (input.langSupport) {
      // stringify array into JSON to match DB TEXT column
      data.langSupport = Array.isArray(input.langSupport)
        ? JSON.stringify(input.langSupport)
        : (input.langSupport as any);
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
    console.log(input, 105);

    const env = await this.prisma.environment.create({
      data: {
        projectId: input.projectId,
        workspaceId: input.workspaceId,
        isDefault: input.isDefault,
        isProd: input.isProd,
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
    console.log(envs, 122);

    return envs.map(this.toEnvironmentDto);
  }

  async findEnvironment(
    projectId: string,
    envId: string,
  ): Promise<EnvironmentDto | null> {
    const env = await this.prisma.environment.findFirst({
      where: { projectId, key: envId },
    });
    return env ? this.toEnvironmentDto(env) : null;
  }

  async updateEnvironment(
    projectId: string,
    envId: string,
    patch: any,
  ): Promise<EnvironmentDto> {
    // normalize booleans
    const doSetDefault = patch.isDefault === true;
    const doSetProd = patch.isProd === true;

    const res = await this.prisma.$transaction(async (tx) => {
      // if isDefault requested, clear others
      if (doSetDefault) {
        await tx.environment.updateMany({
          where: { projectId, NOT: { id: envId } },
          data: { isDefault: false },
        });
      }

      if (doSetProd) {
        await tx.environment.updateMany({
          where: { projectId, NOT: { id: envId } },
          data: { isProd: false },
        });
      }

      const data: any = {};
      if (typeof patch.displayName === 'string')
        data.displayName = patch.displayName;
      if (typeof patch.isDefault === 'boolean')
        data.isDefault = patch.isDefault;
      if (typeof patch.isProd === 'boolean') data.isProd = patch.isProd;

      const updated = await tx.environment.update({
        where: { id: envId },
        data,
      });

      return updated;
    });

    return this.toEnvironmentDto(res as any);
  }

  async deleteEnvironment(projectId: string, envId: string): Promise<void> {
    try {
      // ensure env belongs to project (optional safety)
      const existing = await this.prisma.environment.findUnique({
        where: { id: envId },
      });
      if (!existing || existing.projectId !== projectId) {
        throw new NotFoundException('Environment not found');
      }
      await this.prisma.environment.delete({ where: { id: envId } });
    } catch (e: any) {
      if (e && e.code === 'P2025') {
        throw new NotFoundException('Environment not found');
      }
      throw e;
    }
  }

  /* ========================= SDK Keys ========================= */

  async issueSdkKey(input: IssueSdkKeyDto): Promise<any> {
    const key = await this.prisma.sdkKey.create({
      data: {
        projectId: input.projectId,
        workspaceId: input.workspaceId,
        envId: input.envId,
        key: input.key,
        type: input.type,
        status: KeyStatus.active,
        revoked: false,
      },
    });
    console.log('issued', 214);

    return key;
  }

  async revokeSdkKey(input: RevokeSdkKeyDto): Promise<void> {
    const res = await this.prisma.sdkKey.update({
      where: { id: input.sdkKeyId },
      data: { status: KeyStatus.disabled, revoked: true },
    });
    console.log(res, 'Revoked');
  }

  /**
   * Insert a new active key. If keepOldActive is false (default),
   * immediately disable the previously active key for the same (projectId, envId, type).
   */
  async rotateSdkKey(
    input: RotateSdkKeyDto,
  ): Promise<{ newKey: SdkKeyDto; oldKey?: SdkKeyDto }> {
    const { projectId, workspaceId, envId, type, keepOldActive } = input;

    const res = await this.prisma.$transaction(async (tx) => {
      const old = await tx.sdkKey.findFirst({
        where: {
          projectId,
          workspaceId,
          envId,
          type,
          status: KeyStatus.active,
        },
        orderBy: { createdAt: 'desc' },
      });

      const newKey = await tx.sdkKey.create({
        data: {
          projectId,
          workspaceId,
          envId,
          revoked: false,
          key: input.newKeyHash,
          type,
          status: KeyStatus.active,
          rotatedAt: new Date(),
        },
      });

      let updatedOld = old;
      console.log(old, keepOldActive, 258);

      if (old && !keepOldActive) {
        updatedOld = await tx.sdkKey.update({
          where: { id: old.id },
          data: { status: KeyStatus.disabled, rotatedAt: new Date() },
        });

        console.log(updatedOld, 266);
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
    envId?: string,
    type?: SdkKeyType,
  ): Promise<any[]> {
    const rows = await this.prisma.sdkKey.findMany({
      where: {
        projectId,
        ...(envId ? { envId } : {}),
        ...(type ? { type } : {}),
        status: 'active',
      },
      orderBy: [{ envId: 'asc' }, { type: 'asc' }, { createdAt: 'asc' }],
    });
    return rows;
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
        if (typeof p.langSupport === 'string')
          return p.langSupport
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
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
    isDefault: e.isDefault,
    isProd: e.isProd,
    displayName: e.displayName,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  });

  private toSdkKeyDto = (k: any): SdkKeyDto => ({
    id: k.id,
    projectId: k.projectId,
    workspaceId: k.workspaceId,
    envId: k.envId,
    type: k.type,
    status: k.status,
    lastUsedAt: k.lastUsedAt ?? null,
    rotatedAt: k.rotatedAt ?? null,
    createdBy: k.createdBy,
    createdAt: k.createdAt,
    updatedAt: k.updatedAt,
  });
}
