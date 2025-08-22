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
import {
  UpsertRuleSetDto, PublishRuleSetDto, DistributionDto,
  OutcomeDto,
  RuleDto,
  RuleKind,
} from '../../interface/dto/create-rulesmodule.dto';

@Injectable()
export class RulesmoduleService {
  constructor(@Inject(RulesmoduleRepoToken) private readonly repo: RulesmoduleRepo) { }

  // ------------------------------------------------------------------
  // Editor bootstrap / loaders
  // ------------------------------------------------------------------

  /** Ensure a draft exists (seed from active if needed) and return it. */
  async getOrCreateDraft(p: {
    workspaceId: string;
    projectId: string;
    flagId: string;
    envKey: EnvKey;
    actorUserId: string;
  }): Promise<RuleSetRecord> {
    return this.repo.ensureDraftFromActive(p);
  }

  /** Convenience: return both active & draft for a flag/env (for editor header). */
  async getEditorState(flagId: string, envKey: EnvKey) {
    const [active, draft] = await Promise.all([
      this.repo.getActive(flagId, envKey),
      this.repo.getDraft(flagId, envKey),
    ]);
    return { active, draft };
  }

  async getActive(flagId: string, envKey: EnvKey) {
    const rs = await this.repo.getActive(flagId, envKey);
    if (!rs) throw new NotFoundException(`Active ruleset not found for flag=${flagId}, env=${envKey}`);
    return rs;
  }

  async getDraft(flagId: string, envKey: EnvKey) {
    const rs = await this.repo.getDraft(flagId, envKey);
    if (!rs) throw new NotFoundException(`Draft ruleset not found for flag=${flagId}, env=${envKey}`);
    return rs;
  }

  async listHistory(flagId: string, envKey: EnvKey, limit = 20, offset = 0) {
    return this.repo.listHistory(flagId, envKey, limit, offset);
  }

  // ------------------------------------------------------------------
  // Save (create/update rules inside draft)
  // ------------------------------------------------------------------

  async saveDraft(p: {
    workspaceId: string;
    projectId: string;
    actorUserId: string;
    body: UpsertRuleSetDto;
  }): Promise<RuleSetRecord> {
    const { workspaceId, projectId, actorUserId, body } = p;

    // local validations before persistence
    if (body.rules) this.validateRulesArray(body.rules);
    if (body.prerequisites) this.validatePrerequisitesShape(body.flagId, body.prerequisites);

    // persist via repo (repo does existence checks for segments/prereqs)
    return this.repo.saveDraft({
      workspaceId,
      projectId,
      flagId: body.flagId,
      envKey: body.envKey,
      actorUserId,
      patch: {
        rules: body.rules,
        defaultVar: body.defaultVar,
        killswitch: body.killswitch,
        prerequisites: body.prerequisites,
        salt: body.salt,
      },
    });
  }

  // ------------------------------------------------------------------
  // Publish (atomic: archive old active → promote draft)
  // ------------------------------------------------------------------

  async publish(p: {
    flagId: string;
    envKey: EnvKey;
    actorUserId: string;
    body?: PublishRuleSetDto;
  }) {
    return this.repo.publishDraft({
      flagId: p.flagId,
      envKey: p.envKey,
      actorUserId: p.actorUserId,
      notes: p.body?.notes,
    });
  }

  // ------------------------------------------------------------------
  // SDK config helpers / pass-throughs
  // ------------------------------------------------------------------

  /** For /sdk/config endpoint */
  async getActiveForProjectEnv(projectId: string, envKey: EnvKey) {
    return this.repo.getActiveForProjectEnv(projectId, envKey);
  }

  /** Compute current config hash for a draft or active (useful in tests/tools). */
  async getConfigHash(flagId: string, envKey: EnvKey, which: 'active' | 'draft' = 'active') {
    const rs = which === 'active' ? await this.repo.getActive(flagId, envKey) : await this.repo.getDraft(flagId, envKey);
    if (!rs) throw new NotFoundException(`Ruleset (${which}) not found for flag=${flagId}, env=${envKey}`);
    return this.repo.computeConfigHash(rs);
  }

  // ------------------------------------------------------------------
  // Validation tools (explicit wrappers around repo helpers)
  // ------------------------------------------------------------------

  /** Validate that all segments referenced in the draft exist & are not archived. */
  async validateDraftSegments(flagId: string, envKey: EnvKey, workspaceId: string) {
    const draft = await this.getDraft(flagId, envKey);
    await this.repo.validateSegmentsReferenced(draft.rules, workspaceId);
    return { ok: true };
  }

  /** Validate that all prerequisites in the draft resolve to existing flags in the same project. */
  async validateDraftPrereqs(flagId: string, envKey: EnvKey, projectId: string) {
    const draft = await this.getDraft(flagId, envKey);
    await this.repo.validatePrereqs(draft.prerequisites ?? [], projectId);
    return { ok: true };
  }

  // =====================================================================
  // Local validation (structure/semantics before touching DB)
  // =====================================================================

  private validateRulesArray(rules: RuleDto[]) {
    if (!Array.isArray(rules)) throw new BadRequestException('rules must be an array');

    rules.forEach((rule, i) => {
      if (!rule || typeof rule !== 'object') {
        throw new BadRequestException(`rules[${i}] is not an object`);
      }

      if (rule.kind !== RuleKind.Allow && rule.kind !== RuleKind.Deny) {
        throw new BadRequestException(`rules[${i}].kind must be 'allow' or 'deny'`);
      }

      if (!rule.match) throw new BadRequestException(`rules[${i}].match is required`);

      if (rule.kind === RuleKind.Deny && rule.outcome) {
        throw new BadRequestException(`rules[${i}]: 'deny' rules cannot have an outcome`);
      }

      if (rule.kind === RuleKind.Allow) {
        this.validateOutcome(rule.outcome, i);
      }

      const depth = this.computeMatchDepth(rule.match);
      if (depth > 12) throw new BadRequestException(`rules[${i}].match too deep (depth=${depth} > 12)`);
    });
  }

  private validateOutcome(outcome: OutcomeDto | undefined, idx: number) {
    if (!outcome) return;
    const hasFixed = !!outcome.fixedVariation;
    const hasRollout = !!outcome.rollout;
    if (hasFixed && hasRollout) {
      throw new BadRequestException(`rules[${idx}].outcome cannot have both fixedVariation and rollout`);
    }
    if (hasRollout) this.validateDistribution(outcome.rollout!, idx);
  }

  private validateDistribution(dist: DistributionDto, idx: number) {
    if (!dist.allocations?.length) {
      throw new BadRequestException(`rules[${idx}].outcome.rollout.allocations must be non-empty`);
    }
    let sum = 0;
    const seen = new Set<string>();
    dist.allocations.forEach((a, j) => {
      if (!a.variation) throw new BadRequestException(`rules[${idx}].outcome.rollout.allocations[${j}].variation required`);
      if (seen.has(a.variation)) throw new BadRequestException(`rules[${idx}].outcome.rollout duplicate variation '${a.variation}'`);
      seen.add(a.variation);
      if (typeof a.percent !== 'number' || a.percent < 0 || a.percent > 100) {
        throw new BadRequestException(`rules[${idx}].outcome.rollout.allocations[${j}].percent must be 0..100`);
      }
      sum += a.percent;
    });
    if (sum !== 100) throw new BadRequestException(`rules[${idx}].outcome.rollout percentages must sum to 100 (got ${sum})`);
  }

  private computeMatchDepth(node: any, depth = 0): number {
    if (!node || typeof node !== 'object') return depth;
    let maxChild = depth;
    if (Array.isArray(node.any)) for (const c of node.any) maxChild = Math.max(maxChild, this.computeMatchDepth(c, depth + 1));
    if (Array.isArray(node.all)) for (const c of node.all) maxChild = Math.max(maxChild, this.computeMatchDepth(c, depth + 1));
    if (node.cond || node.segmentId) return Math.max(maxChild, depth + 1);
    if (node.match) return Math.max(maxChild, this.computeMatchDepth(node.match, depth + 1));
    return maxChild;
  }

  private validatePrerequisitesShape(currentFlagId: string, prereqs: any[]) {
    if (!Array.isArray(prereqs)) throw new BadRequestException('prerequisites must be an array');
    prereqs.forEach((p, i) => {
      if (!p || typeof p !== 'object') throw new BadRequestException(`prerequisites[${i}] invalid`);
      if (!p.flagKey || typeof p.flagKey !== 'string') throw new BadRequestException(`prerequisites[${i}].flagKey is required`);
      if (p.flagKey === currentFlagId) throw new BadRequestException(`prerequisites[${i}] cannot reference itself`);
      if (!Array.isArray(p.variations) || p.variations.length === 0) {
        throw new BadRequestException(`prerequisites[${i}].variations must be a non-empty array`);
      }
    });
  }
}
