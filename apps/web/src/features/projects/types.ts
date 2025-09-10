export enum SdkKeyType {
  client = "client",
  server = "server",
}

export enum KeyStatus {
  active = "active",
  revoked = "revoked",
}

type ID = string;
type IsoDate = string; // API returns ISO strings; hydrate to Date if needed

/* =========================
 * Read DTOs (responses)
 * ========================= */

export interface ProjectSummaryDto {
  id: ID;
  workspaceId: ID;
  name: string;
  key: string;
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

export interface EnvironmentDto {
  id: ID;
  projectId: ID;
  key: string;
  displayName: string;
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

export interface SdkKeyDto {
  id: ID;
  projectId: ID;
  workspaceId: ID;
  envKey: string;
  type: SdkKeyType;
  status: KeyStatus;
  lastUsedAt: IsoDate | null;
  rotatedAt: IsoDate | null;
  createdBy: string;
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

export interface ListProjectsResultDto {
  items: ProjectSummaryDto[];
  nextCursor?: string | null;
}

/* =========================
 * Input DTOs (writes)
 * ========================= */

export interface CreateProjectEnvDto {
  key: string;
  displayName: string;
}

export interface CreateProjectKeyDto {
  envKey: string;
  type: SdkKeyType;
  keyHash: string; // plaintext never sent/stored
  createdBy: string;
}

export interface CreateProjectDto {
  workspaceId: ID;
  name: string;
  key: string; // slug
  environments: CreateProjectEnvDto[];
  initialKeys?: CreateProjectKeyDto[];
}

export interface UpdateProjectDto {
  id: ID;
  name?: string;
}

export interface AddEnvironmentDto {
  projectId: ID;
  workspaceId: ID;
  key: string;
  displayName: string;
}

export interface IssueSdkKeyDto {
  projectId: ID;
  workspaceId: ID;
  envKey: string;
  type: SdkKeyType;
  keyHash: string;
  createdBy: string;
}

export interface RevokeSdkKeyDto {
  sdkKeyId: ID;
  reason?: string;
}

export interface RotateSdkKeyDto {
  projectId: ID;
  workspaceId: ID;
  envKey: string;
  type: SdkKeyType;
  newKeyHash: string;
  createdBy: string;
  keepOldActive?: boolean;
}
