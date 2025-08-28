'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { z } from 'zod';

import {
  register as apiRegister,
  login as apiLogin,
  changePassword as apiChangePassword,
  logout as apiLogout,
  deleteAccount as apiDeleteAccount,
  UserSchema,
  type User,
} from './api';
import { http } from '@/src/shared/lib/http';


const ME_QK = ['auth', 'me'] as const;

/** Fetch current user (assumes GET /api/v1/auth/me returns { user: ... } or just user) */
async function fetchMe(): Promise<User> {
  const { data } = await http.get('/api/v1/auth/me');
  // Accept either { user } or plain user
  const parsed = z
    .object({ user: UserSchema })
    .or(UserSchema)
    .safeParse(data);
  if (!parsed.success) throw new Error('Invalid /me response');
  return (parsed.data as any).user ?? parsed.data;
}

export function useMe(options?: { enabled?: boolean }) {
  // Allow caller to turn off automatically (e.g., on public routes)
  const enabled = options?.enabled ?? true;
  return useQuery<User>({
    queryKey: ME_QK,
    queryFn: fetchMe,
    enabled,
    staleTime: 30_000,
    retry: (count, err: any) => {
      // Don't spam retries on 401
      if (err?.response?.status === 401) return false;
      return count < 2;
    },
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiLogin,
    onSuccess: async () => {
      // Token is already persisted & header set in api.ts
      // Now refresh "me" so UI updates immediately
      await qc.invalidateQueries({ queryKey: ME_QK });
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiRegister,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ME_QK });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: apiChangePassword,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiLogout,
    onSuccess: async () => {
      // Clear user cache after token is removed
      await qc.invalidateQueries({ queryKey: ME_QK });
      await qc.removeQueries({ queryKey: ME_QK });
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiDeleteAccount,
    onSuccess: async () => {
      // Same cache cleanup as logout
      await qc.invalidateQueries({ queryKey: ME_QK });
      await qc.removeQueries({ queryKey: ME_QK });
    },
  });
}

export function useAuthState() {
  const me = useMe();
  return useMemo(() => {
    return {
      user: me.data ?? null,
      loading: me.isLoading,
      authenticated: !!me.data && !me.isError,
      error: me.isError ? (me.error as unknown as Error) : null,
    };
  }, [me.data, me.isLoading, me.isError, me.error]);
}
