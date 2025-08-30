type EnvKey = "dev" | "prod" | "stage"
type FlagType = "boolean" | "multivariate" | "json"
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
    workspaceId: string;
    projectId: string;
    key: string;
    type: FlagType;
    description?: string | null;
    createdBy: string;
    name: string;
    tags?: string[];
    envs: CreateFlagEnvConfigDto[];
    comment?: string | null;
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
