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

  // ---------- Load ----------
  async getActive(flagId: string, envKey: EnvKey): Promise<RuleSetRecord | null> {
    const rs = await this.prisma.flagRuleSet.findFirst({
      where: { flagId, envKey, status: 'active' },
      orderBy: { version: 'desc' },
    });
    return rs ? this.map(rs) : null;
  }

  async getDraft(flagId: string, envKey: EnvKey): Promise<RuleSetRecord | null> {
    const rs = await this.prisma.flagRuleSet.findFirst({
      where: { flagId, envKey, status: 'draft' },
      orderBy: { version: 'desc' },
    });
    return rs ? this.map(rs) : null;
  }

  async listHistory(flagId: string, envKey: EnvKey, limit = 20, offset = 0): Promise<RuleSetRecord[]> {
    const rows = await this.prisma.flagRuleSet.findMany({
      where: { flagId, envKey },
      orderBy: [{ status: 'asc' }, { version: 'desc' }],
      skip: offset,
      take: limit,
    });
    return rows.map(this.map);
  }

  // ---------- Draft lifecycle ----------
  async ensureDraftFromActive(params: {
    workspaceId: string;
    projectId: string;
    flagId: string;
    envKey: EnvKey;
    actorUserId: string;
  }): Promise<RuleSetRecord> {
    const { workspaceId, projectId, flagId, envKey, actorUserId } = params;

    // Idempotent: if a draft exists, return it
    const existingDraft = await this.getDraft(flagId, envKey);
    if (existingDraft) return existingDraft;

    // Seed from active if present, else create a blank one
    const active = await this.getActive(flagId, envKey);

    const nextVersion = (active?.version ?? 0) + 1;

    const created = await this.prisma.flagRuleSet.create({
      data: {
        workspaceId,
        projectId,
        flagId,
        envKey,
        version: nextVersion,
        status: 'draft',
        rules: active?.rules ?? [],
        defaultVar: active?.defaultVar ?? 'control',
        killswitch: false,
        prerequisites: active?.prerequisites ?? [],
        salt: active?.salt ?? this.randomSalt(),
        createdBy: actorUserId,
      },
    });

    return this.map(created);
  }

  async saveDraft(input: SaveDraftInput): Promise<RuleSetRecord> {
    const { workspaceId, projectId, flagId, envKey, patch, actorUserId } = input;

    // ensure a draft exists (seeded from active)
    const draft = await this.ensureDraftFromActive({
      workspaceId,
      projectId,
      flagId,
      envKey,
      actorUserId,
    });

    // Optional: validate referenced segments/prereqs before saving (cheap guard)
    if (patch.rules) {
      await this.validateSegmentsReferenced(patch.rules, workspaceId);
    }
    if (patch.prerequisites) {
      await this.validatePrereqs(patch.prerequisites, projectId);
    }

    const updated = await this.prisma.flagRuleSet.update({
      where: { id: draft.id },
      data: {
        // Business impact: partial updates let the UI save incrementally without clobbering
        ...(patch.rules !== undefined ? { rules: patch.rules as any } : {}),
        ...(patch.defaultVar !== undefined ? { defaultVar: patch.defaultVar } : {}),
        ...(patch.killswitch !== undefined ? { killswitch: patch.killswitch } : {}),
        ...(patch.prerequisites !== undefined ? { prerequisites: patch.prerequisites as any } : {}),
        ...(patch.salt !== undefined ? { salt: patch.salt } : {}),
      },
    });

    return this.map(updated);
  }

  // ---------- Publish ----------
  async publishDraft(params: {
    flagId: string;
    envKey: EnvKey;
    actorUserId: string;
    notes?: string;
  }): Promise<PublishResult> {
    const { flagId, envKey, actorUserId } = params;

    // load the latest draft
    const draft = await this.prisma.flagRuleSet.findFirst({
      where: { flagId, envKey, status: 'draft' },
      orderBy: { version: 'desc' },
    });
    if (!draft) {
      throw new Error(`No draft exists for flagId=${flagId}, env=${envKey}`);
    }

    // final validations before publish (prevent prod incidents)
    await this.validateSegmentsReferenced(draft.rules as unknown, draft.workspaceId);
    await this.validatePrereqs(draft.prerequisites as unknown, draft.projectId);

    // compute config hash for CDN / SDK ETag
    const hash = this.computeConfigHash(this.map(draft));

    // transaction: archive previous active, publish draft
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.flagRuleSet.updateMany({
        where: { flagId, envKey, status: 'active' },
        data: { status: 'archived' as Status },
      });

      const published = await tx.flagRuleSet.update({
        where: { id: draft.id },
        data: {
          status: 'active',
          publishedAt: new Date(),
          publishedBy: actorUserId,
          configHash: hash,
        },
      });

      // optional: a separate publications table can be inserted here

      return published;
    });

    return { rulesetId: result.id, version: result.version, configHash: hash };
  }

  // ---------- Hash/etag ----------
  computeConfigHash(ruleset: RuleSetRecord): string {
    // stable hash of the fields the SDK consumes
    const payload = JSON.stringify({
      flagId: ruleset.flagId,
      envKey: ruleset.envKey,
      version: ruleset.version,
      defaultVar: ruleset.defaultVar,
      killswitch: ruleset.killswitch,
      prerequisites: ruleset.prerequisites ?? [],
      salt: ruleset.salt,
      rules: ruleset.rules ?? [],
    });
    return createHash('sha256').update(payload).digest('hex');
  }

  // ---------- Segment helpers ----------
  async segmentExists(segmentId: string, workspaceId: string): Promise<boolean> {
    const count = await this.prisma.segment.count({
      where: { id: segmentId, workspaceId, isArchived: false },
    });
    return count > 0;
  }

  async validateSegmentsReferenced(rulesJson: unknown, workspaceId: string): Promise<void> {
    // walk the rules tree and collect segmentIds
    const segIds = new Set<string>();
    const visit = (node: any) => {
      if (!node) return;
      if (Array.isArray(node)) { node.forEach(visit); return; }
      if (node.segmentId && typeof node.segmentId === 'string') segIds.add(node.segmentId);
      if (node.match) visit(node.match);
      if (node.any) visit(node.any);
      if (node.all) visit(node.all);
      if (node.cond) return; // leaf
      // also dive into rules arrays
      if (node.rules) visit(node.rules);
    };
    visit(rulesJson);

    for (const id of segIds) {
      const ok = await this.segmentExists(id, workspaceId);
      if (!ok) throw new Error(`Referenced segment ${id} does not exist or is archived`);
    }
  }

  // ---------- Prereq helpers ----------
  async flagExists(flagKeyOrId: string, projectId: string): Promise<boolean> {
    // Support both id and key (depending on your Flag model)
    const count = await this.prisma.flag.count({
      where: {
        projectId,
        OR: [{ id: flagKeyOrId }, { key: flagKeyOrId }],
      },
    });
    return count > 0;
  }

  async validatePrereqs(prereqJson: unknown, projectId: string): Promise<void> {
    if (!prereqJson) return;
    const list = Array.isArray(prereqJson) ? prereqJson : [];
    for (const p of list) {
      const key = p?.flagKey;
      if (!key || typeof key !== 'string') {
        throw new Error(`Invalid prerequisite entry (missing flagKey)`);
      }
      const exists = await this.flagExists(key, projectId);
      if (!exists) throw new Error(`Prerequisite flag "${key}" not found in this project`);
      // variation existence validation is typically done in service using Flag.variations
    }
  }

  // ---------- Utilities ----------
  async getActiveForProjectEnv(projectId: string, envKey: EnvKey): Promise<RuleSetRecord[]> {
    const rows = await this.prisma.flagRuleSet.findMany({
      where: { projectId, envKey, status: 'active' },
    });
    return rows.map(this.map);
  }

  // ---------- helpers ----------
  private map = (row: any): RuleSetRecord => ({
    id: row.id,
    workspaceId: row.workspaceId,
    projectId: row.projectId,
    flagId: row.flagId,
    envKey: row.envKey,
    version: row.version,
    status: row.status,
    rules: row.rules,
    defaultVar: row.defaultVar,
    killswitch: row.killswitch,
    prerequisites: row.prerequisites ?? [],
    salt: row.salt,
    configHash: row.configHash ?? null,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    publishedAt: row.publishedAt,
    publishedBy: row.publishedBy,
  });

  private randomSalt(): string {
    return createHash('sha1').update(Math.random().toString() + Date.now().toString()).digest('hex');
  }
}
export const PrismaRulesmoduleRepoProvider = {
  provide: RulesmoduleRepoToken,
  useClass: PrismaRulesmoduleRepository,
};
