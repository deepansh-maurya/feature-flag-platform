'use client';

import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  isKeyTaken,
  getFlagById,
  getFlagByKey,
  listFlagsByProject,
  createFlag,
  createVersion,
  upsertMeta,
  updateFlag,
  archive,
  deleteFlag,
} from "./api";
import { CreateFlagDto, CreateVersionDto, FlagMetaDTO, UpsertFlagMetaDto } from "./types";
/* -------------------- Query Keys -------------------- */
const QK = {
  flagsByProject: (projectId: string) => ["flags", "by-project", projectId] as const,
  flagById: (id: string) => ["flag", "by-id", id] as const,
  flagByKey: (projectId: string, key: string) =>
    ["flag", "by-key", projectId, key] as const,
  keyTaken: (projectId: string, key: string) =>
    ["flag", "key-taken", projectId, key] as const,
};

/* -------------------- Queries ----------------------- */

export function useFlags(projectId?: string) {
  return useQuery<FlagMetaDTO[]>({
    queryKey: QK.flagsByProject(projectId ?? "nil"),
    enabled: !!projectId,
    queryFn: () => listFlagsByProject(projectId as string),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useFlagById(id?: string) {
  return useQuery<FlagMetaDTO | null>({
    queryKey: QK.flagById(id ?? "nil"),
    enabled: !!id,
    queryFn: () => getFlagById(id as string),
    staleTime: 30_000,
  });
}

export function useFlagByKey(projectId?: string, key?: string) {
  return useQuery<FlagMetaDTO | null>({
    queryKey: QK.flagByKey(projectId ?? "nil", key ?? "nil"),
    enabled: !!projectId && !!key,
    queryFn: () => getFlagByKey(projectId as string, key as string),
    staleTime: 30_000,
  });
}

export function useIsKeyTaken(projectId?: string, key?: string) {
  return useQuery<boolean>({
    queryKey: QK.keyTaken(projectId ?? "nil", key ?? ""),
    enabled: !!projectId && !!key && key.length > 0,
    queryFn: () => isKeyTaken({ projectId: projectId as string, key: key as string }),
    staleTime: 5_000,
  });
}

/** Optional: prefetch for a flag details page */
export function usePrefetchFlags(projectId?: string) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!projectId) return;
    qc.prefetchQuery({
      queryKey: QK.flagsByProject(projectId),
      queryFn: () => listFlagsByProject(projectId),
    });
  }, [qc, projectId]);
}

/* -------------------- Mutations (commands) ---------- */

function invalidateProjectFlags(qc: ReturnType<typeof useQueryClient>, projectId: string) {
  qc.invalidateQueries({ queryKey: QK.flagsByProject(projectId) });
}

function invalidateFlag(qc: ReturnType<typeof useQueryClient>, flagId: string) {
  qc.invalidateQueries({ queryKey: QK.flagById(flagId) });
  qc.invalidateQueries({ predicate: q => (q.queryKey as any)[0] === "flags" });
}

export function useCreateFlag(projectIdForInvalidate?: string) {
  const qc = useQueryClient();
  return useMutation<{ flagId: string; versionId: string }, Error, CreateFlagDto>({
    mutationFn: (dto) => createFlag(dto),
    onSuccess: () => {
      if (projectIdForInvalidate) {
        invalidateProjectFlags(qc, projectIdForInvalidate);
      } else {
        qc.invalidateQueries({ predicate: q => (q.queryKey as any)[0] === "flags" });
      }
    },
  });
}

export function useCreateVersion(projectIdForInvalidate?: string, flagIdForInvalidate?: string) {
  const qc = useQueryClient();
  return useMutation<{ versionId: string }, Error, CreateVersionDto>({
    mutationFn: (dto) => createVersion(dto),
    onSuccess: () => {
      if (flagIdForInvalidate) invalidateFlag(qc, flagIdForInvalidate);
      if (projectIdForInvalidate) invalidateProjectFlags(qc, projectIdForInvalidate);
    },
  });
}

export function useUpsertMeta(projectIdForInvalidate?: string, flagIdForInvalidate?: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, UpsertFlagMetaDto>({
    mutationFn: (dto) => upsertMeta(dto),
    onSuccess: () => {
      if (flagIdForInvalidate) invalidateFlag(qc, flagIdForInvalidate);
      if (projectIdForInvalidate) invalidateProjectFlags(qc, projectIdForInvalidate);
    },
  });
}

export function useUpdateFlag(projectIdForInvalidate?: string) {
  const qc = useQueryClient();
  type Payload = { flagId: string; body: { name?: string; description?: string | null; tags?: string[]; archived?: boolean } };
  return useMutation<void, Error, Payload>({
    mutationFn: (p: Payload) => updateFlag(p.flagId, p.body),
    onSuccess: (_data, vars) => {
      if (vars?.flagId) invalidateFlag(qc, vars.flagId);
      if (projectIdForInvalidate) invalidateProjectFlags(qc, projectIdForInvalidate);
    },
  });
}

export function useDeleteFlag(projectIdForInvalidate?: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (flagId: string) => deleteFlag(flagId),
    onSuccess: (_data, flagId) => {
      if (flagId) invalidateFlag(qc, flagId);
      if (projectIdForInvalidate) invalidateProjectFlags(qc, projectIdForInvalidate);
    },
  });
}

export function useArchiveFlag(projectIdForInvalidate: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (flagId) => archive(flagId),
    onSuccess: () => invalidateProjectFlags(qc, projectIdForInvalidate),
  });
}
