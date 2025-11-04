import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFlagRequestDto } from '../../interface/dto/create-flagsmodule.dto';
import {
  FlagMetaDTO,
  FLAGS_REPO,
  FlagsRepository,
} from '../ports/flagsmodule.repo';
import { Flag } from '@prisma/client';
import { UpdateConfig } from 'src/grpcClient';

@Injectable()
export class FlagsmoduleService {
  constructor(
    @Inject(FLAGS_REPO) private readonly repo: FlagsRepository,
    @Inject(FLAGS_REPO) private readonly flagRepo: FlagsRepository,
  ) {}

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

  async createFlag(dto: CreateFlagRequestDto): Promise<Flag> {
    if (
      await this.repo.isKeyTaken({ projectId: dto.projectId, key: dto.key })
    ) {
      throw new ConflictException(
        `A flag with key "${dto.key}" already exists in this project.`,
      );
    }

    const flag = await this.repo.createFlag(dto);
    const env = await this.flagRepo.getEnvFromFlag(flag.id);
    await UpdateConfig(env.id, env.displayName, JSON.stringify(flag));

    return flag;
  }

  async archive(flagId: string): Promise<void> {
    const flag = await this.repo.getById(flagId);
    if (!flag) throw new NotFoundException('Flag not found');
    await this.repo.archive(flagId);
  }

  async updateFlag(
    flagId: string,
    dto: {
      name?: string;
      description?: string | null;
      tags?: string[];
      archived?: boolean;
    },
  ): Promise<void> {
    const flag = await this.repo.getById(flagId);
    if (!flag) throw new NotFoundException('Flag not found');

    if (dto.name !== undefined && String(dto.name).trim().length === 0) {
      throw new BadRequestException('Name cannot be empty');
    }

    const dbFlag = await this.repo.updateFlag(flagId, dto);
    const env = await this.flagRepo.getEnvFromFlag(flagId);
    await UpdateConfig(env.id, env.displayName, JSON.stringify(dbFlag));
  }

  async deleteFlag(flagId: string): Promise<void> {
    const flag = await this.repo.getById(flagId);
    if (!flag) throw new NotFoundException('Flag not found');
    await this.repo.deleteFlag(flagId);
  }
}
