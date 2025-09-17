type SdkKeyType = "client" | "server"

export interface AddEnvironmentDto {
    projectId: string;
    workspaceId: string;
    key: string;
    isDefault:boolean   
    isProd:boolean
    displayName: string;
}

export interface IssueSdkKeyDto {
    projectId: string;
    workspaceId: string;
    envKey: string;
    type: SdkKeyType;
    keyHash: string;   // plaintext never leaves client
    createdBy: string;
}

export interface RevokeSdkKeyDto {
    sdkKeyId: string;
    reason?: string;
}

export interface RotateSdkKeyDto {
    projectId: string;
    workspaceId: string;
    envKey: string;
    type: SdkKeyType;
    newKeyHash: string;
    createdBy: string;
    keepOldActive?: boolean;
}


export type KeyType = "server" | "client";
export type KeyStatus = "active" | "revoked";

export type SdkKey = {
  type: KeyType;
  key: string;           // empty string means "not present"
  created: string;       // key created at
  lastUsed: string;
  usage: number;
  limit: number;
  status: KeyStatus;
  lastRotated?: string;
  note?: string;
  ipAllowlist?: string[];        // server keys
  referrerAllowlist?: string[];  // client keys
};

export type EnvRow = {
  env: string;
  created: string; // environment created at
  keys: SdkKey[];  // 2: server + client
};