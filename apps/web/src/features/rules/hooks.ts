// src/features/rules/hooks.ts
'use client';

import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type { EnvKey, RuleSetRecord, SaveDraftInput, PublishResult } from "./types";
import {
  // load
  getActive,
  getDraft,
  listHistory,
  getActiveForProjectEnv,
  // draft lifecycle
  ensureDraftFromActive,
  saveDraft,
  // create
  createRules,
  // publish
  publishDraft,
  // hash
  computeConfigHash,
  // validation helpers
  segmentExists,
  validateSegmentsReferenced,
  flagExists,
  validatePrereqs,
} from "./api";

/* -------------------- Query Keys -------------------- */
const QK = {
  active: (flagId: string, envKey: EnvKey) => ["rules", "active", flagId, envKey] as const,
  draft: (flagId: string, envKey: EnvKey) => ["rules", "draft", flagId, envKey] as const,
  history: (flagId: string, envKey: EnvKey, limit?: number, offset?: number) =>
    ["rules", "history", flagId, envKey, { limit, offset }] as const,
  sdkActiveByProjectEnv: (projectId: string, envKey: EnvKey) =>
    ["rules", "sdk-active", projectId, envKey] as const,

  // validators
  segmentExists: (segmentId: string, workspaceId: string) =>
    ["rules", "segment-exists", segmentId, workspaceId] as const,
  flagExists: (flagKeyOrId: string, projectId: string) =>
    ["rules", "flag-exists", flagKeyOrId, projectId] as const,
};

/* -------------------- Queries ----------------------- */

export function useActiveRules(flagId?: string, envKey?: EnvKey) {
  return useQuery<RuleSetRecord | null>({
    queryKey: QK.active(flagId ?? "nil", (envKey ?? "dev") as EnvKey),
    enabled: !!flagId && !!envKey,
    queryFn: () => getActive(flagId as string, envKey as EnvKey),
    staleTime: 30_000,
  });
}

export function useDraftRules(flagId?: string, envKey?: EnvKey) {
  return useQuery<RuleSetRecord | null>({
    queryKey: QK.draft(flagId ?? "nil", (envKey ?? "dev") as EnvKey),
    enabled: !!flagId && !!envKey,
    queryFn: () => getDraft(flagId as string, envKey as EnvKey),
    staleTime: 10_000,
  });
}

export function useRulesHistory(flagId?: string, envKey?: EnvKey, limit = 20, offset = 0) {
  return useQuery<RuleSetRecord[]>({
    queryKey: QK.history(flagId ?? "nil", (envKey ?? "dev") as EnvKey, limit, offset),
    enabled: !!flagId && !!envKey,
    queryFn: () => listHistory(flagId as string, envKey as EnvKey, limit, offset),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useActiveRulesForProjectEnv(projectId?: string, envKey?: EnvKey) {
  return useQuery<RuleSetRecord[]>({
    queryKey: QK.sdkActiveByProjectEnv(projectId ?? "nil", (envKey ?? "dev") as EnvKey),
    enabled: !!projectId && !!envKey,
    queryFn: () => getActiveForProjectEnv(projectId as string, envKey as EnvKey),
    staleTime: 30_000,
  });
}

/** Optional: prefetch for a flag rules page */
export function usePrefetchRules(flagId?: string, envKey?: EnvKey) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!flagId || !envKey) return;
    qc.prefetchQuery({
      queryKey: QK.active(flagId, envKey),
      queryFn: () => getActive(flagId, envKey),
    });
    qc.prefetchQuery({
      queryKey: QK.draft(flagId, envKey),
      queryFn: () => getDraft(flagId, envKey),
    });
  }, [qc, flagId, envKey]);
}

/* -------------------- Mutations (commands) ---------- */

function invalidateRules(qc: ReturnType<typeof useQueryClient>, flagId: string, envKey: EnvKey) {
  qc.invalidateQueries({ queryKey: QK.active(flagId, envKey) });
  qc.invalidateQueries({ queryKey: QK.draft(flagId, envKey) });
  qc.invalidateQueries({ predicate: (q) => {
    const k = q.queryKey as unknown;
    if (!Array.isArray(k)) return false;
    return k[0] === "rules" && k[1] === "history";
  } });
}

export function useEnsureDraftFromActive(flagId: string, envKey: EnvKey) {
  const qc = useQueryClient();
  return useMutation<RuleSetRecord, Error, {
    workspaceId: string;
    projectId: string;
    flagId: string;
    envKey: EnvKey;
    actorUserId: string;
  }>({
    mutationFn: (dto) => ensureDraftFromActive(dto),
    onSuccess: () => {
      invalidateRules(qc, flagId, envKey);
    },
  });
}

export function useSaveDraft(flagId: string, envKey: EnvKey) {
  const qc = useQueryClient();
  return useMutation<RuleSetRecord, Error, SaveDraftInput>({
    mutationFn: (dto) => saveDraft(dto),
    onSuccess: () => {
      // refresh draft view; active remains until publish
      qc.invalidateQueries({ queryKey: QK.draft(flagId, envKey) });
    },
  });
}

export function useCreateRules() {
  const qc = useQueryClient();
  return useMutation<unknown, Error, import('./types').CreateRulesInput>({
    mutationFn: (dto) => createRules(dto),
    onSuccess: (_data, vars) => {
      if (vars?.flagId && vars?.envKey) {
        qc.invalidateQueries({ queryKey: QK.active(vars.flagId, vars.envKey) });
        qc.invalidateQueries({ queryKey: QK.draft(vars.flagId, vars.envKey) });
      }
    },
  });
}

export function usePublishDraft(flagId: string, envKey: EnvKey, projectIdForSdkInvalidate?: string) {
  const qc = useQueryClient();
  return useMutation<PublishResult, Error, {
    flagId: string;
    envKey: EnvKey;
    actorUserId: string;
    notes?: string;
  }>({
    mutationFn: (dto) => publishDraft(dto),
    onSuccess: () => {
      // active changed, history grew, draft probably archived/replaced
      invalidateRules(qc, flagId, envKey);
      if (projectIdForSdkInvalidate) {
        qc.invalidateQueries({ queryKey: QK.sdkActiveByProjectEnv(projectIdForSdkInvalidate, envKey) });
      }
    },
  });
}

/* -------------------- Validation / Hash helpers ----- */

export function useComputeConfigHash() {
  return useMutation<{ hash: string }, Error, RuleSetRecord>({
    mutationFn: (ruleset) => computeConfigHash(ruleset),
  });
}

export function useSegmentExists(workspaceId: string) {
  return useMutation<boolean, Error, { segmentId: string }>({
    mutationFn: ({ segmentId }) => segmentExists(segmentId, workspaceId),
  });
}

export function useValidateSegments(workspaceId: string) {
  return useMutation<void, Error, { rulesJson: unknown }>({
    mutationFn: ({ rulesJson }) => validateSegmentsReferenced(rulesJson, workspaceId),
  });
}

export function useFlagExists(projectId: string) {
  return useMutation<boolean, Error, { flagKeyOrId: string }>({
    mutationFn: ({ flagKeyOrId }) => flagExists(flagKeyOrId, projectId),
  });
}

export function useValidatePrereqs(projectId: string) {
  return useMutation<void, Error, { prereqJson: unknown }>({
    mutationFn: ({ prereqJson }) => validatePrereqs(prereqJson, projectId),
  });
}
