// apps/web/src/users/hooks.ts
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserDto,
  CreateUserDto,
  GetUserByEmailDto,
  UpdateUserDto,
  SoftDeleteUserDto,
  WorkspaceDto,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  GetWorkspaceDto,
} from "./types";
import {
  createUser,
  findUserById,
  findUserByEmail,
  updateUser,
  softDeleteUser,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
} from "./api";

/* -------------------- Query Keys -------------------- */
const QK = {
  user: (id: string) => ["user", id] as const,
  userByEmail: (email: string) => ["user", "by-email", email] as const,
  workspace: (id: string) => ["workspace", id] as const,
};

/* -------------------- User Queries -------------------- */
export function useUser(id?: string) {
  return useQuery<UserDto | null>({
    queryKey: QK.user(id ?? "nil"),
    enabled: !!id,
    queryFn: () => findUserById(id as string),
  });
}

export function useUserByEmail(email?: string) {
  return useQuery<UserDto | null>({
    queryKey: QK.userByEmail(email ?? "nil"),
    enabled: !!email,
    queryFn: () => findUserByEmail({ email } as GetUserByEmailDto),
  });
}

/* -------------------- User Mutations -------------------- */
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateUserDto) => createUser(dto),
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: QK.user(user.id) });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateUserDto) => updateUser(dto),
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: QK.user(user.id) });
    },
  });
}

export function useSoftDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: SoftDeleteUserDto) => softDeleteUser(dto),
    onSuccess: (dto) => {
      qc.invalidateQueries({ queryKey: QK.user(dto.id) });
    },
  });
}

/* -------------------- Workspace Queries -------------------- */
export function useWorkspace(id?: string) {
  return useQuery<WorkspaceDto | null>({
    queryKey: QK.workspace(id ?? "nil"),
    enabled: !!id,
    queryFn: () => getWorkspace({ id: id as string }),
  });
}

/* -------------------- Workspace Mutations -------------------- */
export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateWorkspaceDto) => createWorkspace(dto),
    onSuccess: (ws) => {
      qc.invalidateQueries({ queryKey: QK.workspace(ws.id) });
    },
  });
}

export function useUpdateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateWorkspaceDto) => updateWorkspace(dto),
    onSuccess: (ws) => {
      qc.invalidateQueries({ queryKey: QK.workspace(ws.id) });
    },
  });
}
