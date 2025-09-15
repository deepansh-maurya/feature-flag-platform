type EnvKey = "dev" | "prod" | "stage";
type FlagType = "boolean" | "multivariate" | "json";
export interface CreateFlagEnvConfigDto {
  envKey: EnvKey;
  enabled: boolean;

  // For multivariate flags
  variantKey?: string | null;

  // For json flags (and general payload)
  jsonValue?: unknown | null;

  rollout?: number | null;

  // Serialized rule AST
  rules?: unknown | null;
}

export interface CreateFlagDto {
  projectId: string;
  key: string;
  description?: string | null;
  name: string;
  tags?: string[];
}

export interface CreateVersionEnvConfigDto {
  envKey: EnvKey;
  enabled: boolean;
  variantKey?: string | null;
  jsonValue?: unknown | null;
  rollout?: number | null;
  rules?: unknown | null;
}

export interface CreateVersionDto {
  flagId: string;
  createdBy: string;
  comment?: string | null;
  envs: CreateVersionEnvConfigDto[];
}

export interface UpsertFlagMetaDto {
  flagId: string;
  name: string;
  tags?: string[];
}

export interface IsKeyTakenDto {
  projectId: string;
  key: string;
}

export type FlagMetaDTO = {
  id: string;
  key: string;
  type: FlagType;
  description?: string | null;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
  projectId: string;
  name?: string;
  tags?: string[];
};

export type FlagStatus = "on" | "off" | "gradual";

export type Flag = {
  name: string; // key/slug style (e.g., dark_mode_v2)
  status: FlagStatus; // aggregate status (quick glance)
  lastModified: string;
  tags?: string[];
  description?: string;
  key?: string;
  id?: string;
  // whether the flag is archived (server source-of-truth)
  archived?: boolean;
};
