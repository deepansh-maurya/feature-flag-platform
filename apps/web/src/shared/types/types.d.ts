export type Region = "US" | "EU" | "APAC";
export type FlagType = "boolean" | "multivariate" | "experiment";
export type SdkPlatform = "node" | "browser" | "react" | "ios" | "android" | "go" | "python";
export type Env = {
    id: string;
    name: string;
    key: string;
    isProd: boolean;
    sdkKeys: {
        server: string;
        client?: string;
    };
};
export type ChangeControl = {
    requiredForProd: boolean;
    minApprovers?: number;
};
export type Guardrails = {
    mode?: "safe" | "normal" | "aggressive";
    maxRampPercent?: number;
    minHoldMinutes?: number;
};
export type Audit = {
    enabled: boolean;
    webhookUrl?: string;
};
export type ProjectCreate = {
    name: string;
    key: string;
    region: Region;
    timezone: string;
    defaultIdentifier: string;
    bucketingSeed?: string;
    ownerId?: string;
    teamId?: string;
    tags?: string[];
    namingConvention?: string;
    changeControl?: ChangeControl;
    audit?: Audit;
    defaults?: {
        flagType?: FlagType;
        guardrails?: Guardrails;
    };
    integrations?: string[];
    sdkPlatforms?: SdkPlatform[];
    environments: Env[];
};
