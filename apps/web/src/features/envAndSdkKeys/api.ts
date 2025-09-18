import { http } from "@/src/shared/lib/http";
import type {
  // envs
  AddEnvironmentDto,
  // keys
  IssueSdkKeyDto,
  RevokeSdkKeyDto,
  RotateSdkKeyDto,
} from "./types";
import { EnvironmentDto, SdkKeyDto, SdkKeyType } from "../projects/types";

/* -------------------- Environments -------------------- */

export async function addEnvironment(
  input: AddEnvironmentDto
): Promise<EnvironmentDto> {
  const { projectId, ...body } = input as any;
  const { data } = await http.post(
    `/projects/${projectId}/environments`,
    {...body,projectId}
  );
  return data as EnvironmentDto;
}

export async function listEnvironments(
  projectId: string
): Promise<EnvironmentDto[]> {
  const { data } = await http.get(
    `/projects/${projectId}/environments`
  );
  console.log(data);
  
  return data as EnvironmentDto[];
}

export async function findEnvironment(
  projectId: string,
  envKey: string
): Promise<EnvironmentDto | null> {
  const { data } = await http.get(
    `/projects/${projectId}/environments/${encodeURIComponent(envKey)}`
  );
  return (data ?? null) as EnvironmentDto | null;
}

export async function updateEnvironment(
  projectId: string,
  envId: string,
  body: Partial<{ displayName: string; isDefault: boolean; isProd: boolean }> 
): Promise<EnvironmentDto> {
  const { data } = await http.patch(
    `/projects/${projectId}/environments/${envId}`,
    body
  );
  return data as EnvironmentDto;
}

export async function deleteEnvironment(projectId: string, envId: string): Promise<void> {
  await http.delete(`/projects/${projectId}/environments/${envId}`);
}

/* -------------------- SDK Keys -------------------- */

/** Issue a new SDK key (server hashes/stores). */
export async function issueSdkKey(
  input: IssueSdkKeyDto
): Promise<SdkKeyDto> {
  const anyInput = input as any;
  // server expects envId in the body (DTO uses envId). Accept envKey or envId from client.
  const envId = anyInput.envId ?? anyInput.envKey ?? anyInput.env;
  const { projectId, workspaceId, type, key, createdBy } = anyInput;
  const { data } = await http.post(`/projects/${projectId}/sdk-keys`, {
    projectId,
    workspaceId,
    envId,
    type,
    key,
    createdBy,
  });
  return data as SdkKeyDto;
}

/** Revoke a key by ID (idempotent). */
export async function revokeSdkKey(
  input: RevokeSdkKeyDto
): Promise<void> {
  // server controller expects POST /projects/sdk-keys/revoke with { sdkKeyId }
  const { sdkKeyId, reason } = input as any;
  await http.post(`/projects/sdk-keys/revoke`, { sdkKeyId, reason });
}

/**
 * Rotate a key for (projectId, envKey, type).
 * Returns { newKey, oldKey? }. Body carries newKeyHash, createdBy, keepOldActive?
 */
export async function rotateSdkKey(
  input: RotateSdkKeyDto
): Promise<{ newKey: SdkKeyDto; oldKey?: SdkKeyDto }> {
  const anyInput = input as any;
  const { data } = await http.post(`/projects/sdk-keys/rotate`, anyInput);
  return data as { newKey: SdkKeyDto; oldKey?: SdkKeyDto };
}

export async function listSdkKeys(
  projectId: string,
  envKey?: string,
  type?: SdkKeyType
): Promise<SdkKeyDto[]> {
  const { data } = await http.get(`/projects/${projectId}/sdk-keys`, {
    params: { envKey, type },
  });
  return data as SdkKeyDto[];
}
