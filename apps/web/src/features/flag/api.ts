import { http } from "@/src/shared/lib/http";
import { CreateFlagDto, CreateVersionDto, UpsertFlagMetaDto } from "./types";

/** -------------------- Queries -------------------- */

// /api/v1/flags/is-key-taken?projectId=...&key=...
export async function isKeyTaken(params: {
  projectId: string;
  key: string;
}): Promise<boolean> {
  const { data } = await http.get("/api/v1/flags/is-key-taken", {
    params,
  });
  // server may return { taken: boolean } or boolean
  return typeof data === "boolean" ? data : Boolean(data?.taken);
}

// /api/v1/flags/:id
export async function getFlagById(id: string): Promise<UpsertFlagMetaDto | null> {
  const { data } = await http.get(`/api/v1/flags/${id}`);
  return (data ?? null) as UpsertFlagMetaDto | null;
}

// /api/v1/projects/:projectId/flags/by-key?key=...
export async function getFlagByKey(
  projectId: string,
  key: string
): Promise<UpsertFlagMetaDto | null> {
  const { data } = await http.get(
    `/api/v1/projects/${projectId}/flags/by-key`,
    { params: { key } }
  );
  return (data ?? null) as UpsertFlagMetaDto | null;
}

// /api/v1/projects/:projectId/flags
export async function listFlagsByProject(
  projectId: string
): Promise<UpsertFlagMetaDto[]> {
  const { data } = await http.get(`/api/v1/projects/${projectId}/flags`);
  return data as UpsertFlagMetaDto[];
}

/** -------------------- Mutations -------------------- */

// POST /api/v1/projects/:projectId/flags
export async function createFlag(
  input: CreateFlagDto
): Promise<{ flagId: string; versionId: string }> {
  const { projectId, ...body } = input as any;
  const { data } = await http.post(
    `/api/v1/projects/${projectId}/flags`,
    body
  );
  return data as { flagId: string; versionId: string };
}

// POST /api/v1/flags/:flagId/versions
export async function createVersion(
  input: CreateVersionDto
): Promise<{ versionId: string }> {
  const { flagId, ...body } = input as any;
  const { data } = await http.post(
    `/api/v1/flags/${flagId}/versions`,
    body
  );
  return data as { versionId: string };
}

// PUT /api/v1/flags/:flagId/meta
export async function upsertMeta(params: UpsertFlagMetaDto): Promise<void> {
  const { flagId, ...body } = params as any;
  await http.put(`/api/v1/flags/${flagId}/meta`, body);
}

// POST /api/v1/flags/:flagId/archive
export async function archive(flagId: string): Promise<void> {
  await http.post(`/api/v1/flags/${flagId}/archive`);
}
