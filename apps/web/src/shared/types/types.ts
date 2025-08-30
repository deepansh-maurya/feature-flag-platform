export type Region = "US" | "EU" | "APAC";
export type FlagType = "boolean" | "multivariate" | "experiment";
export type SdkPlatform =
  | "node"
  | "browser"
  | "react"
  | "ios"
  | "android"
  | "go"
  | "python";

export type Env = {
  id: string; // local temp id for list operations
  name: string; // "Production"
  key: string; // "production"
  isProd: boolean; // prod policies
  sdkKeys: { server: string; client?: string }; // server always, client optional
};

export type ChangeControl = {
  requiredForProd: boolean;
  minApprovers?: number; // 1..5
};

export type Guardrails = {
  mode?: "safe" | "normal" | "aggressive"; // preset, optional
  maxRampPercent?: number; // 1..100
  minHoldMinutes?: number; // 5..1440
};

export type Audit = {
  enabled: boolean;
  webhookUrl?: string; // url
};

export type ProjectCreate = {
  name: string;
  key: string; // slug
  region: Region;
  timezone: string; // e.g., "Asia/Kolkata"
  defaultIdentifier: string; // e.g., "userId" | "accountId"
  bucketingSeed?: string; // defaults to key server-side
  ownerId?: string; // user id
  teamId?: string; // team id
  tags?: string[];
  namingConvention?: string; // regex string
  changeControl?: ChangeControl;
  audit?: Audit;
  defaults?: {
    flagType?: FlagType;
    guardrails?: Guardrails;
  };
  integrations?: string[]; // ids of integrations
  sdkPlatforms?: SdkPlatform[]; // for snippet prep
  environments: Env[]; // must be >=1
};


