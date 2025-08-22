export type EnvKey = 'dev' | 'stage' | 'prod';

export interface RuleSetRecord {
  id: string;
  workspaceId: string;
  projectId: string;
  flagId: string;
  envKey: EnvKey;
  version: number;
  status: 'draft' | 'active' | 'archived';
  rules: unknown;              // JSON stored
  defaultVar: string;
  killswitch: boolean;
  prerequisites?: unknown;     // JSON [{flagKey, variations:[]}]
  salt: string;
  configHash?: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
  publishedBy?: string | null;
}

export interface SaveDraftInput {
  workspaceId: string;
  projectId: string;
  flagId: string;
  envKey: EnvKey;
  patch: Partial<Pick<RuleSetRecord,
    'rules' | 'defaultVar' | 'killswitch' | 'prerequisites' | 'salt'
  >>;
  actorUserId: string;
}

export interface PublishResult {
  rulesetId: string;
  version: number;
  configHash: string;
}

export interface RulesmoduleRepo {
  // ---------- Load ----------
  getActive(flagId: string, envKey: EnvKey): Promise<RuleSetRecord | null>;
  getDraft(flagId: string, envKey: EnvKey): Promise<RuleSetRecord | null>;
  listHistory(flagId: string, envKey: EnvKey, limit?: number, offset?: number): Promise<RuleSetRecord[]>;

  // ---------- Draft lifecycle ----------
  /**
   * Create a new draft initialized from the current active version (if any).
   * If a draft already exists, return it (idempotent).
   */
  ensureDraftFromActive(params: {
    workspaceId: string;
    projectId: string;
    flagId: string;
    envKey: EnvKey;
    actorUserId: string;
  }): Promise<RuleSetRecord>;

  /**
   * Patch the draft with new rules/prereqs/etc. Returns updated draft.
   */
  saveDraft(input: SaveDraftInput): Promise<RuleSetRecord>;

  // ---------- Publish ----------
  /**
   * Atomically publish the latest draft:
   * - mark previous active as archived,
   * - set draft -> active, bump configHash,
   * - set publishedAt/publishedBy.
   */
  publishDraft(params: {
    flagId: string;
    envKey: EnvKey;
    actorUserId: string;
    notes?: string;
  }): Promise<PublishResult>;

  // ---------- Hash/etag ----------
  computeConfigHash(ruleset: RuleSetRecord): string;

  // ---------- Segment helpers for validation ----------
  segmentExists(segmentId: string, workspaceId: string): Promise<boolean>;
  // optional: ensure all referenced segments are valid/non-archived
  validateSegmentsReferenced(rulesJson: unknown, workspaceId: string): Promise<void>;

  // ---------- Prereq helpers for validation ----------
  flagExists(flagKeyOrId: string, projectId: string): Promise<boolean>;
  validatePrereqs(prereqJson: unknown, projectId: string): Promise<void>;

  // ---------- Utilities ----------
  // used by SDK config endpoint
  getActiveForProjectEnv(projectId: string, envKey: EnvKey): Promise<RuleSetRecord[]>;
}
export const RulesmoduleRepoToken = Symbol('RulesmoduleRepo');
