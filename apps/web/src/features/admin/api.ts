import { http } from "@/src/shared/lib/http";
import { ArchivePlan, CreatePlan, DeleteFeature, DeleteLimit, DeletePrice, GetPlanById, GetPlanByKey, ListPlans, PlanAggregate, PlanFeature, PlanLimit, Price, PublishPlan, SetPriceActive, UpsertFeatures, UpsertLimits, UpsertPrice } from "./types";

// ----------------- Base paths -----------------
const BASE = "/api/v1/admin/plans";

// ----------------- Commands -----------------
export async function createPlan(dto: CreatePlan): Promise<PlanAggregate> {
  const { data } = await http.post(`${BASE}`, dto);
  return data as PlanAggregate;
}

export async function publishPlan(dto: PublishPlan): Promise<void> {
  await http.post(`${BASE}/${dto.planId}/publish`);
}

export async function archivePlan(dto: ArchivePlan): Promise<void> {
  await http.post(`${BASE}/${dto.planId}/archive`);
}

// ----------------- Queries -----------------
export async function getPlanById(dto: GetPlanById): Promise<PlanAggregate | null> {
  const { data } = await http.get(`${BASE}/${dto.planId}`);
  return (data ?? null) as PlanAggregate | null;
}

export async function getPlanByKey(dto: GetPlanByKey): Promise<PlanAggregate | null> {
  const { data } = await http.get(`${BASE}/by-key/${encodeURIComponent(dto.planKey)}`);
  return (data ?? null) as PlanAggregate | null;
}

export async function listPlans(dto?: ListPlans): Promise<PlanAggregate[]> {
  const { data } = await http.get(`${BASE}`, { params: dto ?? {} });
  return (data ?? []) as PlanAggregate[];
}

// ----------------- Optional editors (V2) -----------------
export async function upsertPrice(dto: UpsertPrice): Promise<Price> {
  const { data } = await http.put(`${BASE}/${dto.planId}/prices`, dto);
  return data as Price;
}

export async function setPriceActive(dto: SetPriceActive): Promise<void> {
  await http.post(`/api/v1/admin/prices/${dto.priceId}/active`, { active: dto.active });
}

export async function upsertFeatures(dto: UpsertFeatures): Promise<PlanFeature[]> {
  const { data } = await http.put(`${BASE}/${dto.planId}/features`, dto);
  return data as PlanFeature[];
}

export async function upsertLimits(dto: UpsertLimits): Promise<PlanLimit[]> {
  const { data } = await http.put(`${BASE}/${dto.planId}/limits`, dto);
  return data as PlanLimit[];
}

export async function deletePrice(dto: DeletePrice): Promise<void> {
  await http.delete(`/api/v1/admin/prices/${dto.priceId}`);
}

export async function deleteFeature(dto: DeleteFeature): Promise<void> {
  await http.delete(`${BASE}/${dto.planId}/features/${encodeURIComponent(dto.key)}`);
}

export async function deleteLimit(dto: DeleteLimit): Promise<void> {
  await http.delete(`${BASE}/${dto.planId}/limits/${encodeURIComponent(dto.key)}`);
}
