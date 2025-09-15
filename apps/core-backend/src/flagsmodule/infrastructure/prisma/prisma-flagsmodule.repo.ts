import { Injectable } from '@nestjs/common';
import {
  FlagsRepository,
  FlagMetaDTO,
} from '../../application/ports/flagsmodule.repo';
import PrismaService from 'src/infra/prisma/prisma.service';
import { EnvKey } from 'generated/prisma';
import {
  CreateFlagDto,
  CreateFlagRequestDto,
  CreateVersionDto,
} from 'src/flagsmodule/interface/dto/create-flagsmodule.dto';

@Injectable()
export class PrismaFlagsRepository implements FlagsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ------------- Queries -------------
  async isKeyTaken(params: {
    projectId: string;
    key: string;
  }): Promise<boolean> {
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
    });
    return f ? this.mapFlagMetaDTO(f) : null;
  }

  async getByKey(projectId: string, key: string): Promise<FlagMetaDTO | null> {
    const f = await this.prisma.flag.findFirst({
      where: { projectId, key },
    });
    return f ? this.mapFlagMetaDTO(f) : null;
  }

  async listByProject(projectId: string): Promise<FlagMetaDTO[]> {
    const rows = await this.prisma.flag.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return rows;
  }

  async createFlag(input: CreateFlagRequestDto): Promise<{ flagId: string }> {
    const { projectId, key, description, name, tags = [] } = input;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const flag = await tx.flag.create({
          data: {
            projectId,
            key,
            description: description ?? null,
            name,
            tags,
            workspaceId: (input as any).workspaceId,
          },
        });

        return { flagId: flag.id };
      });

      return result;
    } catch (err: any) {
      if (this.isUniqueConstraint(err, 'Flag_projectId_key_key')) {
        throw new Error(
          `A flag with key "${key}" already exists in this project.`,
        );
      }
      throw err;
    }
  }

  async archive(flagId: string): Promise<void> {
    await this.prisma.flag.update({
      where: { id: flagId },
      data: { archived: true },
    });
  }

  async updateFlag(
    flagId: string,
    data: {
      name?: string;
      description?: string | null;
      tags?: string[];
      archived?: boolean;
    },
  ): Promise<any> {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.tags !== undefined) payload.tags = data.tags;
    if (data.archived !== undefined) payload.archived = data.archived;

    console.log(payload, 'flag update');

    const udpatedFlag = await this.prisma.flag.update({
      where: { id: flagId },
      data: payload,
    });

    console.log(udpatedFlag);
    return udpatedFlag;
  }

  async deleteFlag(flagId: string): Promise<void> {
    await this.prisma.flag.delete({ where: { id: flagId } });
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
      displayName: f.name,
      tags: f.tags ?? [],
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
