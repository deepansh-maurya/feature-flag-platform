import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  EnvKey,
  RulesmoduleRepo,
  RulesmoduleRepoToken,
} from '../ports/rulesmodule.repo';
import { UpdateConfig, UpdateFlagCache } from 'grpcClient';
import {
  FLAGS_REPO,
  FlagsRepository,
} from 'src/flagsmodule/application/ports/flagsmodule.repo';

@Injectable()
export class RulesmoduleService {
  constructor(
    @Inject(RulesmoduleRepoToken) private readonly repo: RulesmoduleRepo,
    @Inject(FLAGS_REPO) private readonly flagRepo: FlagsRepository,
  ) {}

  async createRules(input: {
    workspaceId: string;
    projectId: string;
    flagId: string;
    envKey: EnvKey;
    rawRules: string[];
    interpretedRules?: any;
    actorUserId: string;
    previousRuleSetId?: string;
  }) {
    if (!input.rawRules || input.rawRules.length === 0) {
      throw new BadRequestException('rawRules must be a non-empty array');
    }

    // Call interpreter - the RuleInterpreterService is registered as a provider but not injected here to keep service small.
    // For now, expect caller (controller) to have used RuleInterpreterService and pass in interpreted rules.
    // We'll persist the raw + interpreted rules as part of a draft.

    const payload = input.interpretedRules as unknown;

    const draft = await this.repo.saveDraft({
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      flagId: input.flagId,
      envKey: input.envKey,
      patch: { rules: payload },
      actorUserId: input.actorUserId,
      previousRuleSetId: input.previousRuleSetId,
    });

    await UpdateFlagCache(input.flagId, JSON.stringify(payload));

    const env = await this.flagRepo.getEnvFromFlag(input.flagId);

    await UpdateConfig(env.id, env.displayName, JSON.stringify(payload));
    return draft;
  }
}
