import {  Injectable } from '@nestjs/common';
import { FlagsRepository, FlagMetaDTO } from '../../application/ports/flagsmodule.repo';
import PrismaService from 'src/infra/prisma/prisma.service';
import { EnvKey } from '@prisma/client'
import { CreateFlagDto, CreateVersionDto } from 'src/flagsmodule/interface/dto/create-flagsmodule.dto';

@Injectable()
export class PrismaFlagsRepository implements FlagsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ------------- Queries -------------
  async isKeyTaken(params: { projectId: string; key: string }): Promise<boolean> {
    const { projectId, key } = params;
    const found = await this.prisma.flag.findFirst({
      where: { projectId, key },
      select: { id: true },
    });
    return !!found;
  }

  async getById(id: string): Promise<FlagMetaDTO | null> {
    const f = await this.prisma.flag.findUnique({
      where: { id },
      include: { flagMeta: true },
    });
    return f ? this.mapFlagMetaDTO(f) : null;
  }

  async getByKey(projectId: string, key: string): Promise<FlagMetaDTO | null> {
    const f = await this.prisma.flag.findFirst({
      where: { projectId, key },
      include: { flagMeta: true },
    });
    return f ? this.mapFlagMetaDTO(f) : null;
  }

  async listByProject(projectId: string): Promise<FlagMetaDTO[]> {
    const rows = await this.prisma.flag.findMany({
      where: { projectId, archived: false },
      orderBy: { createdAt: 'desc' },
      include: { flagMeta: true },
    });
    return rows.map((r) => this.mapFlagMetaDTO(r));
  }

  // ------------- Mutations -------------

  /**
   * Creates:
   *  - Flag
   *  - FlagMeta (1:1)
   *  - FlagVersion (version=1, status=draft by default unless you set otherwise)
   *  - FlagEnvConfig[] for all provided envs
   */
  async createFlag(input: CreateFlagDto): Promise<{ flagId: string; versionId: string }> {
    const {
      workspaceId, projectId, key, type, description,
      createdBy, name, tags = [], envs, comment,
    } = input;

    // Defensive checks (these should also be in your service validation)
    if (!envs || envs.length === 0) {
      throw new Error('At least one environment config must be provided.');
    }
    for (const e of envs) {
      if (e.rollout != null && (e.rollout < 0 || e.rollout > 100)) {
        throw new Error(`Invalid rollout for env ${e.envKey}: must be 0..100`);
      }
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1) Flag
        const flag = await tx.flag.create({
          data: {
            workspaceId,
            projectId,
            key,
            type,
            description: description ?? null,
            createdBy,
          },
        });

        // 2) FlagMeta (1:1)
        await tx.flagMeta.create({
          data: {
            flagId: flag.id,
            name,
            tags,
          },
        });

        // 3) Initial version (v1)
        // status defaults to draft (per schema). If you want it active-on-create, pass status explicitly here.
        const version = await tx.flagVersion.create({
          data: {
            flagId: flag.id,
            version: 1,
            comment: comment ?? 'initial create',
            createdBy,
          },
        });

        // 4) Env configs
        // Ensure no duplicates per envKey
        const seen = new Set<EnvKey>();
        for (const e of envs) {
          if (seen.has(e.envKey)) {
            throw new Error(`Duplicate envKey provided: ${e.envKey}`);
          }
          seen.add(e.envKey);

          await tx.flagEnvConfig.create({
            data: {
              flagVersionId: version.id,
              envKey: e.envKey,
              enabled: e.enabled,
              variantKey: e.variantKey ?? null,
              jsonValue: (e.jsonValue as any) ?? null,
              rollout: e.rollout ?? null,
              rules: (e.rules as any) ?? null,
            },
          });
        }

        return { flagId: flag.id, versionId: version.id };
      });

      return result;
    } catch (err: any) {
      // Handle unique constraint (projectId, key)
      if (this.isUniqueConstraint(err, 'Flag_projectId_key_key')) {
        throw new Error(`A flag with key "${key}" already exists in this project.`);
      }
      throw err;
    }
  }

  async createVersion(input: CreateVersionDto): Promise<{ versionId: string }> {
    const { flagId, createdBy, comment, envs } = input;

    if (!envs || envs.length === 0) throw new Error('At least one env config is required.');

    return await this.prisma.$transaction(async (tx) => {
      // next version number
      const last = await tx.flagVersion.findFirst({
        where: { flagId },
        orderBy: { version: 'desc' },
        select: { version: true },
      });
      const nextVersion = (last?.version ?? 0) + 1;

      const version = await tx.flagVersion.create({
        data: {
          flagId,
          version: nextVersion,
          comment: comment ?? null,
          createdBy,
          // status: 'draft' // optional explicit
        },
      });

      const seen = new Set<EnvKey>();
      for (const e of envs) {
        if (seen.has(e.envKey)) throw new Error(`Duplicate envKey: ${e.envKey}`);
        seen.add(e.envKey);

        await tx.flagEnvConfig.create({
          data: {
            flagVersionId: version.id,
            envKey: e.envKey,
            enabled: e.enabled,
            variantKey: e.variantKey ?? null,
            jsonValue: (e.jsonValue as any) ?? null,
            rollout: e.rollout ?? null,
            rules: (e.rules as any) ?? null,
          },
        });
      }

      return { versionId: version.id };
    });
  }

  async upsertMeta(params: { flagId: string; name: string; tags?: string[] }): Promise<void> {
    const { flagId, name, tags = [] } = params;
    await this.prisma.flagMeta.upsert({
      where: { flagId },
      create: { flagId, name, tags },
      update: { name, tags },
    });
  }

  async archive(flagId: string): Promise<void> {
    await this.prisma.flag.update({
      where: { id: flagId },
      data: { archived: true },
    });
  }

  // ------------- Helpers -------------

  private mapFlagMetaDTO(f: any): FlagMetaDTO {
    return {
      id: f.id,
      key: f.key,
      type: f.type,
      description: f.description,
      archived: f.archived,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      workspaceId: f.workspaceId,
      projectId: f.projectId,
      displayName: f.flagMeta?.name,
      tags: f.flagMeta?.tags ?? [],
    };
  }

  private isUniqueConstraint(err: any, indexSuffix: string): boolean {
    // Neon/Postgres + Prisma: code 'P2002' for unique constraint
    if (err?.code === 'P2002') return true;
    // fallback: check message
    const m = String(err?.message || '');
    return m.includes(indexSuffix);
  }
}
