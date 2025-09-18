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
    key: string;   // plaintext never leaves client
}

export interface RevokeSdkKeyDto {
    sdkKeyId: string;
    reason?: string;
}

export interface RotateSdkKeyDto {
    projectId: string;
    workspaceId: string;
    envId: string;
    type: SdkKeyType;
    newKeyHash: string;
    keepOldActive?: boolean;
}


export type KeyType = "server" | "client";
export type KeyStatus = "active" | "revoked";

export type SdkKey = {
  // id from backend SDK key record (optional in mock data)
  id?: string;
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
  id:string,
  env: string;
  created: string; // environment created at
  keys: SdkKey[];  // 2: server + client
};