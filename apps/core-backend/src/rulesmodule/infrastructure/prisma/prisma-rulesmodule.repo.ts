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


@Injectable()
export class PrismaRulesmoduleRepository implements RulesmoduleRepo {
  constructor(private readonly prisma: PrismaService) {}

  async saveDraft(input: SaveDraftInput) {
    const { workspaceId, projectId, flagId, envKey, patch, actorUserId } = input;

    const id = createHash('sha256')
      .update(`${workspaceId}:${projectId}:${flagId}:${Date.now()}`)
      .digest('hex');

    const now = new Date();


    let version = 1;

    if (input.previousRuleSetId) {
      const prev = await this.prisma.flagRuleSet.findUnique({ where: { id: input.previousRuleSetId } });
      if (prev) {
        version = prev.version + 1;
        await this.prisma.flagRuleSet.update({
          where: { id: input.previousRuleSetId },
          data: { killswitch: true },
        });
      }
    } else {
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
        status:"active",
        envKey,
        version,
        rules: patch.rules as any,
        killswitch: patch.killswitch ?? false,
        publishedAt: now,
      },
    });

    return record as unknown as RuleSetRecord;
  }

}
export const PrismaRulesmoduleRepoProvider = {
  provide: RulesmoduleRepoToken,
  useClass: PrismaRulesmoduleRepository,
};