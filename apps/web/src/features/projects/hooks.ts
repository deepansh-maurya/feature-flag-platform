// apps/web/src/projects/components/hooks.ts
'use client';
import { keepPreviousData } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import type {
  // read DTOs
  ProjectSummaryDto,
  ListProjectsResultDto,
  EnvironmentDto,
  SdkKeyDto,
  SdkKeyType,
  // write DTOs
  CreateProjectDto,
  UpdateProjectDto,
  AddEnvironmentDto,
  IssueSdkKeyDto,
  RevokeSdkKeyDto,
  RotateSdkKeyDto,
} from './types';
import {
  // projects
  createProject,
  findProjectById,
  findProjectByKey,
  listProjects,
  updateProject,
  // environments
  addEnvironment,
  listEnvironments,
  findEnvironment,
  // sdk-keys
  issueSdkKey,
  revokeSdkKey,
  rotateSdkKey,
  listSdkKeys,
} from './api';

/* -------------------- Query Keys -------------------- */
const QK = {
  projects: (wsId: string, limit: number, cursor?: string) =>
    ['projects', wsId, { limit, cursor }] as const,

  projectById: (id: string) => ['project', 'by-id', id] as const,

  projectByKey: (wsId: string, key: string) =>
    ['project', 'by-key', wsId, key] as const,

  envs: (projectId: string) => ['envs', projectId] as const,

  env: (projectId: string, envKey: string) =>
    ['env', projectId, envKey] as const,

  sdkKeys: (projectId: string, envKey?: string, type?: SdkKeyType) =>
    ['sdk-keys', projectId, { envKey, type }] as const,
};

/* -------------------- Invalidate helpers -------------------- */
function invalidateProject(qc: ReturnType<typeof useQueryClient>, projectId: string) {
  qc.invalidateQueries({ queryKey: QK.projectById(projectId) });
  qc.invalidateQueries({ queryKey: QK.envs(projectId) });
  qc.invalidateQueries({ predicate: q => q.queryKey[0] === 'projects' }); // list caches
}

function invalidateEnvs(qc: ReturnType<typeof useQueryClient>, projectId: string) {
  qc.invalidateQueries({ queryKey: QK.envs(projectId) });
}

function invalidateSdkKeys(
  qc: ReturnType<typeof useQueryClient>,
  projectId: string
) {
  qc.invalidateQueries({ queryKey: QK.sdkKeys(projectId) });
}

/* -------------------- Queries ----------------------- */

export function useProjectById(id?: string) {
  return useQuery<ProjectSummaryDto | null>({
    queryKey: QK.projectById(id ?? 'nil'),
    enabled: !!id,
    queryFn: () => findProjectById(id as string),
    staleTime: 30_000,
  });
}

export function useProjectByKey(workspaceId?: string, key?: string) {
  return useQuery<ProjectSummaryDto | null>({
    queryKey: QK.projectByKey(workspaceId ?? 'nil', key ?? 'nil'),
    enabled: !!workspaceId && !!key,
    queryFn: () => findProjectByKey(workspaceId as string, key as string),
    staleTime: 30_000,
  });
}

export function useProjects(
  limit: number = 20,
  cursor?: string
) {
  return useQuery<ListProjectsResultDto>({
    queryKey: QK.projects('nil', limit, cursor),
    queryFn: () => listProjects( limit, cursor),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  }); 
}

export function useEnvironments(projectId?: string) {
  return useQuery<EnvironmentDto[]>({
    queryKey: QK.envs(projectId ?? 'nil'),
    enabled: !!projectId,
    queryFn: () => listEnvironments(projectId as string),
    staleTime: 30_000,
  });
}

export function useEnvironment(projectId?: string, envKey?: string) {
  return useQuery<EnvironmentDto | null>({
    queryKey: QK.env(projectId ?? 'nil', envKey ?? 'nil'),
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
    queryKey: QK.sdkKeys(projectId ?? 'nil', envKey, type),
    enabled: !!projectId,
    queryFn: () => listSdkKeys(projectId as string, envKey, type),
    staleTime: 30_000,
  });
}

/** Optional: prefetch common data for a project detail page */
export function usePrefetchProject(projectId?: string) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!projectId) return;
    qc.prefetchQuery({
      queryKey: QK.projectById(projectId),
      queryFn: () => findProjectById(projectId),
    });
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

/* -------------------- Mutations (commands) ---------- */

export function useCreateProject(workspaceIdForInvalidate?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProjectDto  ) => createProject(dto),
    onSuccess: () => {
      if (workspaceIdForInvalidate) {
        qc.invalidateQueries({
          predicate: q =>
            q.queryKey[0] === 'projects' &&
            (q.queryKey as any)[1] === workspaceIdForInvalidate,
        });
      } else {
        qc.invalidateQueries({ predicate: q => q.queryKey[0] === 'projects' });
      }
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProjectDto) => updateProject(dto),
    onSuccess: (proj) => {
      invalidateProject(qc, proj.id);
    },
  });
}

export function useAddEnvironment(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AddEnvironmentDto) => addEnvironment(dto),
    onSuccess: () => invalidateEnvs(qc, projectId),
  });
}

export function useIssueSdkKey(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: IssueSdkKeyDto) => issueSdkKey(dto),
    onSuccess: () => invalidateSdkKeys(qc, projectId),
  });
}

export function useRevokeSdkKey(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: RevokeSdkKeyDto) => revokeSdkKey(dto),
    onSuccess: () => invalidateSdkKeys(qc, projectId),
  });
}

export function useRotateSdkKey(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: RotateSdkKeyDto) => rotateSdkKey(dto),
    onSuccess: () => invalidateSdkKeys(qc, projectId),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      return (async () => {
        const { deleteProject } = await import('./api');
        return deleteProject(id);
      })();
    },
    // optimistic update: remove project from lists immediately
    onMutate: async (id: string) => {
      await qc.cancelQueries({ predicate: q => q.queryKey[0] === 'projects' });
      const previous = qc.getQueriesData({ predicate: q => q.queryKey[0] === 'projects' });
      // remove project from any cached lists
      previous.forEach(([key, data]) => {
        if (!data) return;
        try {
          const next = { ...data } as any;
          if (Array.isArray(next.items)) {
            next.items = next.items.filter((p: any) => p.id !== id);
          }
          qc.setQueryData(key as any, next);
        } catch (e) {
          // ignore
        }
      });
      return { previous };
    },
    onError: (_err, _id, context: any) => {
      // rollback
      if (context?.previous) {
        context.previous.forEach(([key, data]: any) => qc.setQueryData(key, data));
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ predicate: q => q.queryKey[0] === 'projects' });
    },
  });
}
