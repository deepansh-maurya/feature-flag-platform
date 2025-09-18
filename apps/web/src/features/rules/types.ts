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


export type Rule = {
  id: string;
  name: string;
  text?: string;
  conditions: string[];
  priority: number;
  enabled: boolean;
  source?:
    | { kind: "local" }
    | { kind: "segment"; key: string; linked: boolean };
};

export type Flag = {
  key: string;
  envRules: Record<EnvKey, Rule[]>;
  updatedAt: string;
};

export type Segment = {
  key: string;
  name: string;
  hint: string;
  tokens: string[];
};
export type Version = {
  id: string;
  ts: string;
  author: string;
  note?: string;
  snapshot: Flag;
};