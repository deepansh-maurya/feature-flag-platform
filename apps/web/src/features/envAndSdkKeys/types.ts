type SdkKeyType = "client" | "server"

export interface AddEnvironmentDto {
    projectId: string;
    workspaceId: string;
    key: string;
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
