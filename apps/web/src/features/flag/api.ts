import { http } from "@/src/shared/lib/http";
import { CreateFlagDto, CreateVersionDto, FlagMetaDTO, UpsertFlagMetaDto } from "./types";

/** -------------------- Queries -------------------- */

// /api/v1/flags/is-key-taken?projectId=...&key=...
export async function isKeyTaken(params: {
  projectId: string;
  key: string;
}): Promise<boolean> {
  const { data } = await http.get("/flagsmodule/key-available", {
    params,
  });
  // server returns { available: boolean }
  if (typeof data === 'boolean') return !data;
  return !Boolean(data?.available);
}

// /api/v1/flags/:id
export async function getFlagById(id: string): Promise<FlagMetaDTO | null> {
  const { data } = await http.get(`/flagsmodule/${id}`);
  return (data ?? null) as FlagMetaDTO | null;
}

// /api/v1/projects/:projectId/flags/by-key?key=...
export async function getFlagByKey(
  projectId: string,
  key: string
): Promise<FlagMetaDTO | null> {
  const { data } = await http.get(`/flagsmodule/by-key/${projectId}/${encodeURIComponent(key)}`);
  return (data ?? null) as FlagMetaDTO | null;
}

// /api/v1/projects/:projectId/flags
export async function listFlagsByProject(
  projectId: string
): Promise<FlagMetaDTO[]> {
  const { data } = await http.get(`/flagsmodule/project/${projectId}`);
  return data as FlagMetaDTO[];
}

/** -------------------- Mutations -------------------- */

// POST /api/v1/projects/:projectId/flags
export async function createFlag(
  input: CreateFlagDto
): Promise<{ flagId: string; versionId: string }> {
  const { data } = await http.post(`/flagsmodule`, input);
  return data as { flagId: string; versionId: string };
}

// POST /api/v1/flags/:flagId/versions
export async function createVersion(
  input: CreateVersionDto
): Promise<{ versionId: string }> {
  const { flagId, ...body } = input as any;
  const { data } = await http.post(`/flagsmodule/${flagId}/versions`, body);
  return data as { versionId: string };
}

// PUT /api/v1/flags/:flagId/meta
export async function upsertMeta(params: UpsertFlagMetaDto): Promise<void> {
  const { flagId, ...body } = params as any;
  // new: patch the flag resource directly (no /meta suffix)
  await http.patch(`/flagsmodule/${flagId}`, body);
}

// PATCH /api/v1/flags/:flagId
export async function updateFlag(flagId: string, body: { name?: string; description?: string | null; tags?: string[]; archived?: boolean }): Promise<void> {
  await http.patch(`/flagsmodule/${flagId}`, body as any);
}

// DELETE /api/v1/flags/:flagId
export async function deleteFlag(flagId: string): Promise<void> {
  await http.delete(`/flagsmodule/${flagId}`);
}

// POST /api/v1/flags/:flagId/archive
export async function archive(flagId: string): Promise<void> {
  await http.patch(`/flagsmodule/${flagId}/archive`);
}
