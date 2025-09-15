// apps/core-backend/src/flagsmodule/application/use-cases/flagsmodule.service.ts
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnvKey, FlagType } from 'generated/prisma'
import { CreateFlagDto, CreateFlagEnvConfigDto, CreateFlagRequestDto, CreateVersionDto, CreateVersionEnvConfigDto, UpsertFlagMetaDto } from '../../interface/dto/create-flagsmodule.dto';
import { FlagMetaDTO, FLAGS_REPO, FlagsRepository } from '../ports/flagsmodule.repo';

@Injectable()
export class FlagsmoduleService {
  constructor(@Inject(FLAGS_REPO) private readonly repo: FlagsRepository) {}

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------
  async isKeyAvailable(projectId: string, key: string): Promise<boolean> {
    const taken = await this.repo.isKeyTaken({ projectId, key });
    return !taken;
  }

  async getById(id: string): Promise<FlagMetaDTO> {
    const flag = await this.repo.getById(id);
    if (!flag) throw new NotFoundException('Flag not found');
    return flag;
  }

  async getByKey(projectId: string, key: string): Promise<FlagMetaDTO> {
    const flag = await this.repo.getByKey(projectId, key);
    if (!flag) throw new NotFoundException('Flag not found');
    return flag;
  }

  async listByProject(projectId: string): Promise<FlagMetaDTO[]> {
    return this.repo.listByProject(projectId);
  }
 
  async createFlag(dto: CreateFlagRequestDto): Promise<{ flagId: string }> {
    if (await this.repo.isKeyTaken({ projectId: dto.projectId, key: dto.key })) {
      throw new ConflictException(`A flag with key "${dto.key}" already exists in this project.`);
    }
    return this.repo.createFlag(dto);
  }

  async archive(flagId: string): Promise<void> {
    // Ensure flag exists
    const flag = await this.repo.getById(flagId);
    if (!flag) throw new NotFoundException('Flag not found');
    await this.repo.archive(flagId);
  }

  async updateFlag(flagId: string, dto: { name?: string; description?: string | null; tags?: string[]; archived?: boolean }): Promise<void> {
    // Ensure flag exists
    const flag = await this.repo.getById(flagId);
    if (!flag) throw new NotFoundException('Flag not found');

    // Basic validation: name if provided must be non-empty
    if (dto.name !== undefined && String(dto.name).trim().length === 0) {
      throw new BadRequestException('Name cannot be empty');
    }

    return await this.repo.updateFlag(flagId, dto);
  }

  async deleteFlag(flagId: string): Promise<void> {
    const flag = await this.repo.getById(flagId);
    if (!flag) throw new NotFoundException('Flag not found');
    await this.repo.deleteFlag(flagId);
  }
}
