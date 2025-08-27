import { http } from "@/src/shared/lib/http";

// ----------------- Base paths -----------------
const BASE = "/api/v1/admin/plans";

// ----------------- Commands -----------------
export async function createPlan(dto: CreatePlanDto): Promise<PlanAggregate> {
  const { data } = await http.post(`${BASE}`, dto);
  return data as PlanAggregate;
}

export async function publishPlan(dto: PublishPlanDto): Promise<void> {
  await http.post(`${BASE}/${dto.planId}/publish`);
}

export async function archivePlan(dto: ArchivePlanDto): Promise<void> {
  await http.post(`${BASE}/${dto.planId}/archive`);
}

// ----------------- Queries -----------------
export async function getPlanById(dto: GetPlanByIdDto): Promise<PlanAggregate | null> {
  const { data } = await http.get(`${BASE}/${dto.planId}`);
  return (data ?? null) as PlanAggregate | null;
}

export async function getPlanByKey(dto: GetPlanByKeyDto): Promise<PlanAggregate | null> {
  const { data } = await http.get(`${BASE}/by-key/${encodeURIComponent(dto.planKey)}`);
  return (data ?? null) as PlanAggregate | null;
}

export async function listPlans(dto?: ListPlansDto): Promise<PlanAggregate[]> {
  const { data } = await http.get(`${BASE}`, { params: dto ?? {} });
  return (data ?? []) as PlanAggregate[];
}

// ----------------- Optional editors (V2) -----------------
export async function upsertPrice(dto: UpsertPriceDto): Promise<Price> {
  const { data } = await http.put(`${BASE}/${dto.planId}/prices`, dto);
  return data as Price;
}

export async function setPriceActive(dto: SetPriceActiveDto): Promise<void> {
  await http.post(`/api/v1/admin/prices/${dto.priceId}/active`, { active: dto.active });
}

export async function upsertFeatures(dto: UpsertFeaturesDto): Promise<PlanFeature[]> {
  const { data } = await http.put(`${BASE}/${dto.planId}/features`, dto);
  return data as PlanFeature[];
}

export async function upsertLimits(dto: UpsertLimitsDto): Promise<PlanLimit[]> {
  const { data } = await http.put(`${BASE}/${dto.planId}/limits`, dto);
  return data as PlanLimit[];
}

export async function deletePrice(dto: DeletePriceDto): Promise<void> {
  await http.delete(`/api/v1/admin/prices/${dto.priceId}`);
}

export async function deleteFeature(dto: DeleteFeatureDto): Promise<void> {
  await http.delete(`${BASE}/${dto.planId}/features/${encodeURIComponent(dto.key)}`);
}

export async function deleteLimit(dto: DeleteLimitDto): Promise<void> {
  await http.delete(`${BASE}/${dto.planId}/limits/${encodeURIComponent(dto.key)}`);
}
