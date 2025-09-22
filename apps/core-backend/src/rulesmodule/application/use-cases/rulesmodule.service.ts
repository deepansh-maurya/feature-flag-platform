// application/use-cases/rulesmodule.service.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EnvKey,
  RuleSetRecord,
  RulesmoduleRepo,
  RulesmoduleRepoToken,
} from '../ports/rulesmodule.repo';


@Injectable()
export class RulesmoduleService {
  constructor(@Inject(RulesmoduleRepoToken) private readonly repo: RulesmoduleRepo) { }

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
    // Basic validation
    if (!input.rawRules || input.rawRules.length === 0) {
      throw new BadRequestException('rawRules must be a non-empty array');
    }

    // Call interpreter - the RuleInterpreterService is registered as a provider but not injected here to keep service small.
    // For now, expect caller (controller) to have used RuleInterpreterService and pass in interpreted rules.
    // We'll persist the raw + interpreted rules as part of a draft.

    const payload = input.interpretedRules ?? { rules: input.rawRules };

    const draft = await this.repo.saveDraft({
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      flagId: input.flagId,
      envKey: input.envKey,
      patch: { rules: payload },
      actorUserId: input.actorUserId,
      previousRuleSetId: input.previousRuleSetId,
    });

    return draft;
  }


}