export type EnvKey = 'dev' | 'stage' | 'prod';

export interface RuleSetRecord {
  id: string;
  workspaceId: string;
  projectId: string;
  flagId: string;
  envKey: EnvKey;
  version: number;
  rules: unknown; // JSON stored
  killswitch: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
}

export interface SaveDraftInput {
  workspaceId: string;
  projectId: string;
  flagId: string;
  envKey: EnvKey;
  patch: Partial<Pick<RuleSetRecord, 'rules' | 'killswitch'>>;
  actorUserId: string;
  previousRuleSetId?: string;
}

export interface PublishResult {
  rulesetId: string;
  version: number;
}

export interface RulesmoduleRepo {
  // Save a new ruleset draft (creates a new version entry)
  saveDraft(input: SaveDraftInput): Promise<RuleSetRecord>;
}

export const RulesmoduleRepoToken = Symbol('RulesmoduleRepo');
