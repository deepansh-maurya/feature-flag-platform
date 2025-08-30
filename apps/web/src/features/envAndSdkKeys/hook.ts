"use client";

import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type {
    // envs
    AddEnvironmentDto,
    // keys
    IssueSdkKeyDto,
    RevokeSdkKeyDto,
    RotateSdkKeyDto,
} from "./types";
import {
  // envs
  addEnvironment,
  listEnvironments,
  findEnvironment,
  // keys
  issueSdkKey,
  revokeSdkKey,
  rotateSdkKey,
  listSdkKeys,
} from "./api";
import { EnvironmentDto, SdkKeyDto, SdkKeyType } from "../projects/types";

/* -------------------- Query Keys -------------------- */
const QK = {
  envs: (projectId: string) => ["envs", projectId] as const,
  env: (projectId: string, envKey: string) =>
    ["env", projectId, envKey] as const,
  sdkKeys: (projectId: string, envKey?: string, type?: SdkKeyType) =>
    ["sdk-keys", projectId, { envKey, type }] as const,
};

/* -------------------- Queries ----------------------- */

export function useEnvironments(projectId?: string) {
  return useQuery<EnvironmentDto[]>({
    queryKey: QK.envs(projectId ?? "nil"),
    enabled: !!projectId,
    queryFn: () => listEnvironments(projectId as string),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useEnvironment(projectId?: string, envKey?: string) {
  return useQuery<EnvironmentDto | null>({
    queryKey: QK.env(projectId ?? "nil", envKey ?? "nil"),
    enabled: !!projectId && !!envKey,
    queryFn: () => findEnvironment(projectId as string, envKey as string),
    staleTime: 30_000,
  });
}

export function useSdkKeys(
  projectId?: string,
  envKey?: string,
  type?: SdkKeyType
) {
  return useQuery<SdkKeyDto[]>({
    queryKey: QK.sdkKeys(projectId ?? "nil", envKey, type),
    enabled: !!projectId,
    queryFn: () => listSdkKeys(projectId as string, envKey, type),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

/** Optional: prefetch for project detail screens */
export function usePrefetchEnvsAndKeys(projectId?: string) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!projectId) return;
    qc.prefetchQuery({
      queryKey: QK.envs(projectId),
      queryFn: () => listEnvironments(projectId),
    });
    qc.prefetchQuery({
      queryKey: QK.sdkKeys(projectId),
      queryFn: () => listSdkKeys(projectId),
    });
  }, [qc, projectId]);
}

/* -------------------- Mutations --------------------- */

function invalidateEnvs(qc: ReturnType<typeof useQueryClient>, projectId: string) {
  qc.invalidateQueries({ queryKey: QK.envs(projectId) });
  qc.invalidateQueries({ predicate: (q) => (q.queryKey as any)[0] === "env" });
}

function invalidateKeys(qc: ReturnType<typeof useQueryClient>, projectId: string) {
  qc.invalidateQueries({ queryKey: QK.sdkKeys(projectId) });
}

export function useAddEnvironment(projectId: string) {
  const qc = useQueryClient();
  return useMutation<EnvironmentDto, Error, AddEnvironmentDto>({
    mutationFn: (dto) => addEnvironment(dto),
    onSuccess: () => invalidateEnvs(qc, projectId),
  });
}

export function useIssueSdkKey(projectId: string) {
  const qc = useQueryClient();
  return useMutation<SdkKeyDto, Error, IssueSdkKeyDto>({
    mutationFn: (dto) => issueSdkKey(dto),
    onSuccess: () => invalidateKeys(qc, projectId),
  });
}

export function useRevokeSdkKey(projectId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, RevokeSdkKeyDto>({
    mutationFn: (dto) => revokeSdkKey(dto),
    onSuccess: () => invalidateKeys(qc, projectId),
  });
}

export function useRotateSdkKey(projectId: string) {
  const qc = useQueryClient();
  return useMutation<{ newKey: SdkKeyDto; oldKey?: SdkKeyDto }, Error, RotateSdkKeyDto>({
    mutationFn: (dto) => rotateSdkKey(dto),
    onSuccess: () => invalidateKeys(qc, projectId),
  });
}
