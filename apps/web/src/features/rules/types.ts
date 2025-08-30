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
