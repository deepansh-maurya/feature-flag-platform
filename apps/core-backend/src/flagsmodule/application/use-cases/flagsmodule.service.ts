// apps/core-backend/src/flagsmodule/application/use-cases/flagsmodule.service.ts
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnvKey, FlagType } from 'generated/prisma';
import { CreateFlagDto, CreateFlagEnvConfigDto, CreateVersionDto, CreateVersionEnvConfigDto, UpsertFlagMetaDto } from '../../interface/dto/create-flagsmodule.dto';
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

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------
  async createFlag(dto: CreateFlagDto): Promise<{ flagId: string; versionId: string }> {
    // 1) Key uniqueness inside project
    if (await this.repo.isKeyTaken({ projectId: dto.projectId, key: dto.key })) {
      throw new ConflictException(`A flag with key "${dto.key}" already exists in this project.`);
    }

    // 2) Validate env configs vs flag type
    this.validateEnvConfigsForType(dto.type, dto.envs);

    // 3) Persist
    return this.repo.createFlag(dto);
  }

  async createVersion(dto: CreateVersionDto): Promise<{ versionId: string }> {
    // 1) Ensure flag exists
    const flag = await this.repo.getById(dto.flagId);
    if (!flag) throw new NotFoundException('Flag not found');

    // 2) Validate env configs vs flag type (need the flag type)
    this.validateEnvConfigsForType(flag.type, dto.envs);

    // 3) Persist
    return this.repo.createVersion(dto);
  }

  async upsertMeta(dto: UpsertFlagMetaDto): Promise<void> {
    // Ensure flag exists
    const flag = await this.repo.getById(dto.flagId);
    if (!flag) throw new NotFoundException('Flag not found');

    // Basic guard: empty name checked in DTO; tags length also validated in DTO layer
    await this.repo.upsertMeta(dto);
  }

  async archive(flagId: string): Promise<void> {
    // Ensure flag exists
    const flag = await this.repo.getById(flagId);
    if (!flag) throw new NotFoundException('Flag not found');
    await this.repo.archive(flagId);
  }

  // ---------------------------------------------------------------------------
  // Internal validations (extra safety beyond DTO rules)
  // ---------------------------------------------------------------------------
  private validateEnvConfigsForType(
    type: FlagType,
    envs: Array<CreateFlagEnvConfigDto | CreateVersionEnvConfigDto>,
  ): void {
    if (!envs || envs.length === 0) {
      throw new BadRequestException('At least one environment config must be provided.');
    }

    // No duplicate envs
    const seen = new Set<EnvKey>();
    for (const e of envs) {
      if (seen.has(e.envKey)) {
        throw new BadRequestException(`Duplicate environment provided: ${e.envKey}`);
      }
      seen.add(e.envKey);
    }

    // Type‑specific checks
    for (const e of envs) {
      // rollout range (DTO enforces, but keep here for defense)
      if (e.rollout != null && (e.rollout < 0 || e.rollout > 100)) {
        throw new BadRequestException(`Invalid rollout for ${e.envKey}: must be 0..100`);
      }

      switch (type) {
        case FlagType.boolean:
          // boolean flags should not carry variant/json payloads
          if (e.variantKey) {
            throw new BadRequestException(
              `variantKey is not allowed for boolean flags (env=${e.envKey}).`,
            );
          }
          if (e.jsonValue != null) {
            throw new BadRequestException(
              `jsonValue is not allowed for boolean flags (env=${e.envKey}).`,
            );
          }
          break;

        case FlagType.multivariate:
          // optional rule: if enabled, either variantKey present, or rules/jsonValue controls it.
          // enforce at least one of variantKey|rules (loose), unless using experiment infra later.
          if (e.enabled && !e.variantKey && !e.rules) {
            // Allow empty to support future rules only rollouts; comment out if you want strictness:
            // throw new BadRequestException(
            //   `For multivariate flags, provide variantKey or rules (env=${e.envKey}).`,
            // );
          }
          break;

        case FlagType.json:
          // json flags: require jsonValue when enabled (unless rules decide)
          if (e.enabled && e.jsonValue == null && !e.rules) {
            throw new BadRequestException(
              `For JSON flags, provide jsonValue or rules (env=${e.envKey}).`,
            );
          }
          // variantKey doesn’t make sense for json flags
          if (e.variantKey) {
            throw new BadRequestException(
              `variantKey is not allowed for JSON flags (env=${e.envKey}).`,
            );
          }
          break;

        default:
          throw new BadRequestException(`Unsupported flag type: ${type as any}`);
      }
    }
  }
}
