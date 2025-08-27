// src/features/admin-plans/hooks.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    type PlanKey,
    type PlanAggregate,
    type ListPlans,
    type CreatePlan,
    type PublishPlan,
    type ArchivePlan,
    type UpsertPrice,
    type SetPriceActive,
    type UpsertFeatures,
    type UpsertLimits,
    type DeletePrice,
    type DeleteFeature,
    type DeleteLimit,
} from './types';

import {
    listPlans as apiListPlans,
    getPlanById as apiGetPlanById,
    getPlanByKey as apiGetPlanByKey,
    createPlan as apiCreatePlan,
    publishPlan as apiPublishPlan,
    archivePlan as apiArchivePlan,
    upsertPrice as apiUpsertPrice,
    setPriceActive as apiSetPriceActive,
    upsertFeatures as apiUpsertFeatures,
    upsertLimits as apiUpsertLimits,
    deletePrice as apiDeletePrice,
    deleteFeature as apiDeleteFeature,
    deleteLimit as apiDeleteLimit,

} from "./api"

// ---------------- Query Keys ----------------
const QK = {
    list: (filter?: ListPlans) =>
        ['admin', 'plans', 'list', filter?.status ?? null, filter?.includeArchived ?? null] as const,
    byId: (id: string) => ['admin', 'plans', 'byId', id] as const,
    byKey: (key: PlanKey) => ['admin', 'plans', 'byKey', key] as const,
};

// --------------- Queries --------------------
export function usePlans(filter?: ListPlans) {
    return useQuery<PlanAggregate[]>({
        queryKey: QK.list(filter),
        queryFn: () => apiListPlans(filter),
        staleTime: 10_000,
    });
}

export function usePlanById(planId?: string) {
    return useQuery<PlanAggregate | null>({
        queryKey: QK.byId(planId ?? 'nil'),
        queryFn: () => (planId ? apiGetPlanById({ planId }) : Promise.resolve(null)),
        enabled: !!planId,
        staleTime: 10_000,
    });
}

export function usePlanByKey(planKey?: PlanKey) {
    return useQuery<PlanAggregate | null>({
        queryKey: QK.byKey((planKey as PlanKey) ?? ('nil' as PlanKey)),
        queryFn: () => (planKey ? apiGetPlanByKey({ planKey }) : Promise.resolve(null)),
        enabled: !!planKey,
        staleTime: 10_000,
    });
}

// --------------- Mutations ------------------
export function useCreatePlan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreatePlan) => apiCreatePlan(dto),
        onSuccess: (created: any) => {
            // seed caches and refresh list
            qc.setQueryData(QK.byId(created.id), created);
            qc.setQueryData(QK.byKey(created.key), created);
            qc.invalidateQueries({ queryKey: QK.list() });
        },
    });
}

export function usePublishPlan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: PublishPlan) => apiPublishPlan(dto),
        onSuccess: (_data, dto) => {
            // update cached plan status if present
            qc.setQueryData<PlanAggregate | undefined>(QK.byId(dto.planId), (prev: any) =>
                prev ? { ...prev, status: 'published' } : prev
            );
            qc.invalidateQueries({ queryKey: QK.list() });
        },
    });
}

export function useArchivePlan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: ArchivePlan) => apiArchivePlan(dto),
        onSuccess: (_data, dto) => {
            qc.setQueryData<PlanAggregate | undefined>(QK.byId(dto.planId), (prev: any) =>
                prev ? { ...prev, status: 'archived' } : prev
            );
            qc.invalidateQueries({ queryKey: QK.list() });
        },
    });
}

// ----- Editors (Prices / Features / Limits) -----
export function useUpsertPrice() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: UpsertPrice) => apiUpsertPrice(dto),
        onSuccess: (price, dto) => {
            // refresh the plan cache to reflect new/updated price
            qc.invalidateQueries({ queryKey: QK.byId(dto.planId) });
            qc.invalidateQueries({ queryKey: QK.list() });
            // optional: if you rely on byKey, also invalidate it
        },
    });
}

export function useSetPriceActive() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: SetPriceActive) => apiSetPriceActive(dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: QK.list() });
            // caller can also manually invalidate a specific plan if they have the id
        },
    });
}

export function useUpsertFeatures() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: UpsertFeatures) => apiUpsertFeatures(dto),
        onSuccess: (_features, dto) => {
            qc.invalidateQueries({ queryKey: QK.byId(dto.planId) });
            qc.invalidateQueries({ queryKey: QK.list() });
        },
    });
}

export function useUpsertLimits() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: UpsertLimits) => apiUpsertLimits(dto),
        onSuccess: (_limits, dto) => {
            qc.invalidateQueries({ queryKey: QK.byId(dto.planId) });
            qc.invalidateQueries({ queryKey: QK.list() });
        },
    });
}

export function useDeletePrice() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: DeletePrice) => apiDeletePrice(dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: QK.list() });
        },
    });
}

export function useDeleteFeature() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: DeleteFeature) => apiDeleteFeature(dto),
        onSuccess: (_void, dto) => {
            qc.invalidateQueries({ queryKey: QK.byId(dto.planId) });
            qc.invalidateQueries({ queryKey: QK.list() });
        },
    });
}

export function useDeleteLimit() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: DeleteLimit) => apiDeleteLimit(dto),
        onSuccess: (_void, dto) => {
            qc.invalidateQueries({ queryKey: QK.byId(dto.planId) });
            qc.invalidateQueries({ queryKey: QK.list() });
        },
    });
}
