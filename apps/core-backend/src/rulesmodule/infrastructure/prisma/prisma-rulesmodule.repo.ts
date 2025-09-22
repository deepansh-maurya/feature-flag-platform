// rulesmodule/infrastructure/prisma/prisma-rulesmodule.repo.ts
import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import {
  EnvKey,
  PublishResult,
  RuleSetRecord,
  RulesmoduleRepo,
  RulesmoduleRepoToken,
  SaveDraftInput,
} from '../../application/ports/rulesmodule.repo';
import PrismaService from 'src/infra/prisma/prisma.service';

type Status = 'draft' | 'active' | 'archived';

@Injectable()
export class PrismaRulesmoduleRepository implements RulesmoduleRepo {
  constructor(private readonly prisma: PrismaService) {}

  async saveDraft(input: SaveDraftInput) {
    const { workspaceId, projectId, flagId, envKey, patch, actorUserId } = input;

    // Create a simple hash id for the ruleset
    const id = createHash('sha256')
      .update(`${workspaceId}:${projectId}:${flagId}:${Date.now()}`)
      .digest('hex');

    const now = new Date();


    // Compute version:
    let version = 1;

    if (input.previousRuleSetId) {
      // If previousRuleSetId provided, fetch that ruleset
      const prev = await this.prisma.flagRuleSet.findUnique({ where: { id: input.previousRuleSetId } });
      if (prev) {
        version = prev.version + 1;
        // Disable previous ruleset by setting killswitch=true (soft disable)
        await this.prisma.flagRuleSet.update({
          where: { id: input.previousRuleSetId },
          data: { killswitch: true },
        });
      }
    } else {
      // Determine highest existing version for this flag/env and increment
      const latest = await this.prisma.flagRuleSet.findFirst({
        where: { flagId, envKey },
        orderBy: { version: 'desc' },
      });
      if (latest) version = latest.version + 1;
    }

    const record = await this.prisma.flagRuleSet.create({
      data: {
        id,
        workspaceId,
        projectId,
        flagId,
        envKey,
        version,
        rules: patch.rules as any,
        killswitch: patch.killswitch ?? false,
        publishedAt: null,
      },
    });

    return record as unknown as RuleSetRecord;
  }

}
export const PrismaRulesmoduleRepoProvider = {
  provide: RulesmoduleRepoToken,
  useClass: PrismaRulesmoduleRepository,
};