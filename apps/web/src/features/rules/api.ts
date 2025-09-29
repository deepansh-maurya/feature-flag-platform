// src/features/rules/api.ts
import { http } from "@/src/shared/lib/http";
import type {
  RuleSetRecord,
  SaveDraftInput,
  PublishResult,
  EnvKey,
} from "./types";

/* -------------------- Load -------------------- */

export async function getActive(flagId: string, envKey: EnvKey): Promise<RuleSetRecord | null> {
  const { data } = await http.get(`/flags/${flagId}/rules/${encodeURIComponent(envKey)}/active`);
  return (data ?? null) as RuleSetRecord | null;
}

export async function getDraft(flagId: string, envKey: EnvKey): Promise<RuleSetRecord | null> {
  const { data } = await http.get(`/flags/${flagId}/rules/${encodeURIComponent(envKey)}/draft`);
  return (data ?? null) as RuleSetRecord | null;
}

export async function listHistory(
  flagId: string,
  envKey: EnvKey,
  limit?: number,
  offset?: number
): Promise<RuleSetRecord[]> {
  const { data } = await http.get(
    `/flags/${flagId}/rules/${encodeURIComponent(envKey)}/history`,
    { params: { limit, offset } }
  );
  return data as RuleSetRecord[];
}

/* -------------------- Draft lifecycle -------------------- */

export async function ensureDraftFromActive(params: {
  workspaceId: string;
  projectId: string;
  flagId: string;
  envKey: EnvKey;
  actorUserId: string;
}): Promise<RuleSetRecord> {
  const { flagId, envKey, ...body } = params;
  const { data } = await http.post(
    `/flags/${flagId}/rules/${encodeURIComponent(envKey)}/draft/ensure`,
    body
  );
  return data as RuleSetRecord;
}

export async function saveDraft(input: SaveDraftInput): Promise<RuleSetRecord> {
  const { flagId, envKey, ...body } = input as SaveDraftInput & { flagId?: string; envKey?: EnvKey };
  const { data } = await http.put(
    `/flags/${flagId}/rules/${encodeURIComponent(envKey)}/draft`,
    body
  );
  return data as RuleSetRecord;
}

/* -------------------- Create (interpret + persist) -------------------- */

// Create rules for a flag: caller provides workspaceId, projectId, flagId, envKey, actorUserId, rawRules[]
import type { CreateRulesInput } from "./types";

export async function createRules(input: CreateRulesInput): Promise<unknown> {
  const { data } = await http.post(`/rules/create`, input);
  return data as unknown;
}

/* -------------------- Publish -------------------- */

export async function publishDraft(params: {
  flagId: string;
  envKey: EnvKey;
  actorUserId: string;
  notes?: string;
}): Promise<PublishResult> {
  const { flagId, envKey, ...body } = params as {
    flagId: string;
    envKey: EnvKey;
    actorUserId: string;
    notes?: string;
  };
  const { data } = await http.post(
    `/flags/${flagId}/rules/${encodeURIComponent(envKey)}/draft/publish`,
    body
  );
  return data as PublishResult;
}

/* -------------------- Hash / etag -------------------- */

export async function computeConfigHash(ruleset: RuleSetRecord): Promise<{ hash: string }> {
  const { data } = await http.post(`/rules/compute-hash`, { ruleset });
  return data as { hash: string };
}

/* -------------------- Validation helpers -------------------- */

export async function segmentExists(segmentId: string, workspaceId: string): Promise<boolean> {
  const { data } = await http.get(`/segments/${segmentId}/exists`, { params: { workspaceId } });
  return typeof data === "boolean" ? data : Boolean(data?.exists);
}

export async function validateSegmentsReferenced(rulesJson: unknown, workspaceId: string): Promise<void> {
  await http.post(`/segments/validate`, { workspaceId, rulesJson });
}

export async function flagExists(flagKeyOrId: string, projectId: string): Promise<boolean> {
  const { data } = await http.get(`/projects/${projectId}/flags/exists`, {
    params: { keyOrId: flagKeyOrId },
  });
  return typeof data === "boolean" ? data : Boolean(data?.exists);
}

export async function validatePrereqs(prereqJson: unknown, projectId: string): Promise<void> {
  await http.post(`/projects/${projectId}/flags/validate-prereqs`, { projectId, prereqJson });
}

/* -------------------- Utilities for SDK endpoint -------------------- */

export async function getActiveForProjectEnv(projectId: string, envKey: EnvKey): Promise<RuleSetRecord[]> {
  const { data } = await http.get(`/projects/${projectId}/rules/${encodeURIComponent(envKey)}/active`);
  return data as RuleSetRecord[];
}
