"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  register as apiRegister,
  login as apiLogin,
  changePassword as apiChangePassword,
  logout as apiLogout,
  deleteAccount as apiDeleteAccount,
  type User,
  fetchMe
} from "./api";

const ME_QK = ["auth", "me"] as const;

export function useMe() {
  return useQuery<User>({
    queryKey: ["me"], 
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000, 
    retry: (failureCount, error: any) => {
      // Don't retry on Unauthorized
      if (error?.response?.status === 401) return false;
      return failureCount < 2; 
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,   
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
    }
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiRegister,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ME_QK });
    }
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: apiChangePassword
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
    }
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
    }
  });
}
