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

/* -------------------- SDK Keys -------------------- */

/** Issue a new SDK key (server hashes/stores). */
export async function issueSdkKey(
  input: IssueSdkKeyDto
): Promise<SdkKeyDto> {
  const { projectId, envKey, ...body } = input as any;
  const { data } = await http.post(
    `/projects/${projectId}/environments/${encodeURIComponent(
      envKey
    )}/sdk-keys`,
    body
  );
  return data as SdkKeyDto;
}

/** Revoke a key by ID (idempotent). */
export async function revokeSdkKey(
  input: RevokeSdkKeyDto
): Promise<void> {
  const { sdkKeyId, reason } = input as any;
  await http.post(`/sdk-keys/${sdkKeyId}/revoke`, { reason });
}

/**
 * Rotate a key for (projectId, envKey, type).
 * Returns { newKey, oldKey? }. Body carries newKeyHash, createdBy, keepOldActive?
 */
export async function rotateSdkKey(
  input: RotateSdkKeyDto
): Promise<{ newKey: SdkKeyDto; oldKey?: SdkKeyDto }> {
  const { projectId, envKey, type, ...body } = input as any;
  const { data } = await http.post(
    `/projects/${projectId}/environments/${encodeURIComponent(
      envKey
    )}/sdk-keys/rotate`,
    { type, ...body }
  );
  return data as { newKey: SdkKeyDto; oldKey?: SdkKeyDto };
}

/** List keys for a project (optional filters). */
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
