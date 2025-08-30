// apps/web/src/projects/components/api.ts
import { http } from "@/src/shared/lib/http";
import {
  // Projects
  CreateProjectDto,
  UpdateProjectDto,
  ProjectSummaryDto,
  ListProjectsResultDto,

  // Environments
  AddEnvironmentDto,
  EnvironmentDto,

  // SDK Keys
  IssueSdkKeyDto,
  RevokeSdkKeyDto,
  RotateSdkKeyDto,
  SdkKeyDto,
  SdkKeyType,
} from "./types";

/** -------------------- Projects -------------------- */

export async function createProject(
  input: CreateProjectDto
): Promise<ProjectSummaryDto> {
  const { data } = await http.post("/api/v1/projects", input);
  return data as ProjectSummaryDto;
}

export async function findProjectById(
  id: string
): Promise<ProjectSummaryDto | null> {
  const { data } = await http.get(`/api/v1/projects/${id}`);
  return (data ?? null) as ProjectSummaryDto | null;
}

/**
 * Look up by (workspaceId, key)
 * Kept as a query for cacheability & simplicity on the client.
 */
export async function findProjectByKey(
  workspaceId: string,
  key: string
): Promise<ProjectSummaryDto | null> {
  const { data } = await http.get(
    `/api/v1/projects/by-key`,
    { params: { workspaceId, key } }
  );
  return (data ?? null) as ProjectSummaryDto | null;
}

/**
 * Cursor pagination: /projects?workspaceId=...&limit=...&cursor=...
 */
export async function listProjects(
  workspaceId: string,
  limit: number,
  cursor?: string
): Promise<ListProjectsResultDto> {
  const { data } = await http.get("/api/v1/projects", {
    params: { workspaceId, limit, cursor },
  });
  return data as ListProjectsResultDto;
}

export async function updateProject(
  input: UpdateProjectDto
): Promise<ProjectSummaryDto> {
  const { id, ...patch } = input as any;
  const { data } = await http.patch(`/api/v1/projects/${id}`, patch);
  return data as ProjectSummaryDto;
}

/** -------------------- Environments -------------------- */

export async function addEnvironment(
  input: AddEnvironmentDto
): Promise<EnvironmentDto> {
  const { projectId, ...body } = input as any;
  const { data } = await http.post(
    `/api/v1/projects/${projectId}/environments`,
    body
  );
  return data as EnvironmentDto;
}

export async function listEnvironments(
  projectId: string
): Promise<EnvironmentDto[]> {
  const { data } = await http.get(
    `/api/v1/projects/${projectId}/environments`
  );
  return data as EnvironmentDto[];
}

export async function findEnvironment(
  projectId: string,
  envKey: string
): Promise<EnvironmentDto | null> {
  const { data } = await http.get(
    `/api/v1/projects/${projectId}/environments/${encodeURIComponent(envKey)}`
  );
  return (data ?? null) as EnvironmentDto | null;
}

/** -------------------- SDK Keys -------------------- */

/**
 * Issue a new SDK key for (projectId, envKey, type)
 * Body matches IssueSdkKeyDto so the server can hash & store.
 */
export async function issueSdkKey(
  input: IssueSdkKeyDto
): Promise<SdkKeyDto> {
  const { projectId, envKey, ...body } = input as any;
  const { data } = await http.post(
    `/api/v1/projects/${projectId}/environments/${encodeURIComponent(
      envKey
    )}/sdk-keys`,
    body
  );
  return data as SdkKeyDto;
}

/**
 * Revoke by key id (or composite, depending on your DTO).
 * Using POST to keep idempotent server logic + audit trail.
 */
export async function revokeSdkKey(input: RevokeSdkKeyDto): Promise<void> {
  const { keyId, reason } = input as any;
  await http.post(`/api/v1/sdk-keys/${keyId}/revoke`, { reason });
}

/**
 * Rotate returns { newKey, oldKey? } so client can show/backup once.
 */
export async function rotateSdkKey(
  input: RotateSdkKeyDto
): Promise<{ newKey: SdkKeyDto; oldKey?: SdkKeyDto }> {
  const { keyId } = input as any;
  const { data } = await http.post(`/api/v1/sdk-keys/${keyId}/rotate`);
  return data as { newKey: SdkKeyDto; oldKey?: SdkKeyDto };
}

/**
 * List by project, optional envKey + type filter for admin UX.
 */
export async function listSdkKeys(
  projectId: string,
  envKey?: string,
  type?: SdkKeyType
): Promise<SdkKeyDto[]> {
  const { data } = await http.get(`/api/v1/projects/${projectId}/sdk-keys`, {
    params: { envKey, type },
  });
  return data as SdkKeyDto[];
}
