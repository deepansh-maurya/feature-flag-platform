"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import type { GetOverviewDto, GetFlagMetricsDto, RecordEvaluationDto } from "./types";
import { getOverview, getFlagMetrics, recordEvaluation } from "./api";

import type {
    CreateAuditLog,
    AuditLogRecord,
    ListAuditLogsParams,
    ListResult,
} from "./types";
import {
    append,
    getById,
    list,
    exportCsv,
    exportCsvBlob,
} from "./api";
import { useEffect } from "react";

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





/* ------------- Query Keys ------------- */
const AQK = {
    list: (p: ListAuditLogsParams | undefined) =>
        [
            "audit",
            "list",
            p?.workspaceId ?? "nil",
            p?.projectId ?? "nil",
            p?.envKey ?? "nil",
            p?.actionType ?? "nil",
            p?.entityType ?? "nil",
            p?.actorUserId ?? "nil",
            p?.search ?? "nil",
            p?.limit ?? 50,
            p?.cursor ?? null,
            p?.direction ?? "backward",
        ] as const,
    byId: (id?: string) => ["audit", "by-id", id ?? "nil"] as const,
    exportCsv: (p: ListAuditLogsParams | undefined) =>
        ["audit", "export-csv", p?.workspaceId ?? "nil"] as const,
};

/* ------------- Queries ------------- */

export function useAuditList(params?: ListAuditLogsParams) {
    const enabled = !!params?.workspaceId;
    return useQuery<ListResult>({
        queryKey: AQK.list(params),
        enabled,
        queryFn: () => list(params as ListAuditLogsParams),
        staleTime: 30_000,
        placeholderData: keepPreviousData,
    });
}

export function useAuditById(id?: string) {
    return useQuery<AuditLogRecord | null>({
        queryKey: AQK.byId(id),
        enabled: !!id,
        queryFn: () => getById(id as string),
        staleTime: 60_000,
    });
}

/** Optional prefetch (e.g., when opening details drawer) */
export function usePrefetchAudit(q: ListAuditLogsParams | undefined) {
    const qc = useQueryClient();
    useEffect(() => {
        if (!q?.workspaceId) return;
        qc.prefetchQuery({
            queryKey: AQK.list(q),
            queryFn: () => list(q),
        });
    }, [qc, q?.workspaceId, q?.projectId, q?.envKey, q?.cursor]);
}

/* ------------- Mutations ------------- */

export function useAppendAudit(workspaceScopedListParams?: ListAuditLogsParams) {
    const qc = useQueryClient();
    return useMutation<void, Error, CreateAuditLog>({
        mutationFn: (dto) => append(dto),
        onSuccess: () => {
            // keep page fresh in activity-heavy views
            if (workspaceScopedListParams?.workspaceId) {
                qc.invalidateQueries({ queryKey: AQK.list(workspaceScopedListParams) });
            } else {
                qc.invalidateQueries({ predicate: (q) => (q.queryKey as any)[0] === "audit" });
            }
        },
    });
}

/**
 * Export CSV text. Use for server-to-server or when you want raw CSV string.
 * For browser download UX, prefer useExportAuditCsvBlob below.
 */
export function useExportAuditCsv() {
    return useMutation<string, Error, ListAuditLogsParams>({
        mutationFn: (p) => exportCsv(p),
    });
}

/** Export CSV as Blob and hand back an object URL for easy download */
export function useExportAuditCsvBlob() {
    return useMutation<string, Error, ListAuditLogsParams>({
        mutationFn: async (p) => {
            const blob = await exportCsvBlob(p);
            return URL.createObjectURL(blob); // caller can do: <a href={url} download="audit.csv" />
        },
    });
}


