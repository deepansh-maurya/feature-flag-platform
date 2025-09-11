// src/features/billing/hooks.ts
'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Cancel,
  ChangePlan,
  Entitlements,
  Portal,
  Resume,
  StartCheckout,
  Subscription,
} from './types';
import {
  startCheckout,
  changePlan,
  cancel as cancelSub,
  resume as resumeSub,
  createPortalSession,
  getCurrentSubscription,
  getEntitlements,
} from './api';

// -------------------- Query Keys --------------------
const QK = {
  sub: (wsId: string) => ['billing', 'subscription', wsId] as const,
  ent: (wsId: string) => ['billing', 'entitlements', wsId] as const,
};

function invalidateBilling(qc: ReturnType<typeof useQueryClient>, wsId: string) {
  qc.invalidateQueries({ queryKey: QK.sub(wsId) });
  qc.invalidateQueries({ queryKey: QK.ent(wsId) });
}

// -------------------- Queries -----------------------
export function useSubscription(workspaceId?: string) {
  return useQuery<Subscription | null>({
    queryKey: QK.sub(workspaceId ?? 'nil'),
    enabled: !!workspaceId,
    queryFn: () => getCurrentSubscription(workspaceId as string),
    staleTime: 30_000,
  });
}

export function useEntitlements(workspaceId?: string) {
  return useQuery<Entitlements>({
    queryKey: QK.ent(workspaceId ?? 'nil'),
    enabled: !!workspaceId,
    queryFn: () => getEntitlements(workspaceId as string),
    staleTime: 30_000,
  });
}

/** Optional: prefetch both on mount (nice for dashboards) */
export function usePrefetchBilling(workspaceId?: string) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!workspaceId) return;
    qc.prefetchQuery({ queryKey: QK.sub(workspaceId), queryFn: () => getCurrentSubscription(workspaceId) });
    qc.prefetchQuery({ queryKey: QK.ent(workspaceId), queryFn: () => getEntitlements(workspaceId) });
  }, [qc, workspaceId]);
}

// -------------------- Mutations (commands) ----------

/** Opens Stripe Checkout on success */
export function useOpenCheckout() {
  return useMutation({
    mutationFn: (dto: StartCheckout) => startCheckout(dto),
    onSuccess: (data) => {
     return data
    },
  });
}

/** Opens Stripe Billing Portal on success */
export function useOpenBillingPortal() {
  return useMutation({
    mutationFn: (dto: Portal) => createPortalSession(dto),
    onSuccess: ({ url }) => {
      window.location.assign(url);
    },
  });
}

/** Change plan (upgrade/downgrade). DB sync arrives via webhooks. */
export function useChangePlan(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ChangePlan) => changePlan(dto),
    onSuccess: () => invalidateBilling(qc, workspaceId),
  });
}

/** Cancel subscription (immediate or at period end). */
export function useCancelSubscription(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Cancel) => cancelSub(dto),
    onSuccess: () => invalidateBilling(qc, workspaceId),
  });
}

/** Resume subscription (if cancel_at_period_end was set). */
export function useResumeSubscription(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Resume) => resumeSub(dto),
    onSuccess: () => invalidateBilling(qc, workspaceId),
  });
}
