"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import type { GetOverviewDto, GetFlagMetricsDto, RecordEvaluationDto } from "./types";
import { getOverview, getFlagMetrics, recordEvaluation } from "./api";

/* -------------------- Query Keys -------------------- */
const QK = {
    overview: (dto: GetOverviewDto | undefined) => [
        "analytics",
        "overview",
        // make key stable: pick fields commonly used for scoping
        dto?.projectId ?? "nil",
        dto?.envKey ?? "nil",
        dto?.from ?? "nil",
        dto?.to ?? "nil",
    ] as const,

    flagMetrics: (dto: GetFlagMetricsDto | undefined) => [
        "analytics",
        "flag-metrics",
        dto?.flagId ?? "nil",
        dto?.envKey ?? "nil",
        dto?.from ?? "nil",
        dto?.to ?? "nil",
    ] as const,
};

/* -------------------- Queries ----------------------- */

export function useOverview(dto?: GetOverviewDto) {
    const enabled =
        (!!dto?.projectId || true); // allow workspace-only
    return useQuery({
        queryKey: QK.overview(dto),
        enabled,
        queryFn: () => getOverview(dto as GetOverviewDto),
        staleTime: 30_000,
        placeholderData: keepPreviousData, // smooth date-range changes
    });
}

export function useFlagMetrics(dto?: GetFlagMetricsDto) {
    const enabled = !!dto?.flagId;
    return useQuery({
        queryKey: QK.flagMetrics(dto),
        enabled,
        queryFn: () => getFlagMetrics(dto as GetFlagMetricsDto),
        staleTime: 30_000,
        placeholderData: keepPreviousData,
    });
}

/* -------------------- Mutations --------------------- */

/**
 * Record a single evaluation event. Usually called from SDK host (server)
 * or from your web app when you simulate/e2e. Fire-and-forget.
 */
export function useRecordEvaluation() {
    const qc = useQueryClient();
    return useMutation<void, Error, RecordEvaluationDto>({
        mutationFn: (dto) => recordEvaluation(dto),
        onSuccess: (_data, vars) => {
            // light heuristic: if you just recorded an event for a flag/env in a visible dashboard
            // you can gently invalidate affected queries so charts tick up quickly.
            if ((vars as any).flagId) {
                qc.invalidateQueries({ predicate: (q) => (q.queryKey as any)[0] === "analytics" });
            }
        },
    });
}
