import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import type { AdminmoduleRepo, PlanAggregate } from '../../application/ports/adminmodule.repo';
import { ArchivePlanDto, CreatePlanDto, DeleteFeatureDto, DeleteLimitDto, DeletePriceDto, EnrollDto, GetPlanByIdDto, GetPlanByKeyDto, ListPlansDto, PublishPlanDto, SetPriceActiveDto, UpsertFeaturesDto, UpsertLimitsDto, UpsertPriceDto } from 'src/adminmodule/interface/dto/create-adminmodule.dto';

export type PlanEntitlements = {
  features: Record<string, boolean>;
  limits: Record<string, { soft?: number; hard?: number }>;
};
import * as jwt from "jsonwebtoken";

export const AdminmoduleRepoToken = Symbol('AdminmoduleRepo');

@Injectable()
export class AdminmoduleService {
  constructor(
    @Inject('AdminmoduleRepo') private readonly repo: AdminmoduleRepo,
  ) { }

  // ---------- Commands ----------
  createPlan(dto: CreatePlanDto) {
    return this.repo.createPlan(dto);
  }

  publishPlan(dto: PublishPlanDto) {
    return this.repo.publishPlan(dto);
  }

  archivePlan(dto: ArchivePlanDto) {
    return this.repo.archivePlan(dto);
  }

  // ---------- Queries ----------
  getPlanById(dto: GetPlanByIdDto) {
    return this.repo.getPlanById(dto);
  }

  getPlanByKey(dto: GetPlanByKeyDto) {
    return this.repo.getPlanByKey(dto);
  }

  listPlans(dto?: ListPlansDto) {
    return this.repo.listPlans(dto);
  }

  // ---------- Editors (optional/V2) ----------
  upsertPrice(dto: UpsertPriceDto) {
    return this.repo.upsertPrice!(dto);
  }

  setPriceActive(dto: SetPriceActiveDto) {
    return this.repo.setPriceActive!(dto);
  }

  upsertFeatures(dto: UpsertFeaturesDto) {
    return this.repo.upsertFeatures!(dto);
  }

  upsertLimits(dto: UpsertLimitsDto) {
    return this.repo.upsertLimits!(dto);
  }

  deletePrice(dto: DeletePriceDto) {
    return this.repo.deletePrice!(dto);
  }

  deleteFeature(dto: DeleteFeatureDto) {
    return this.repo.deleteFeature!(dto);
  }

  deleteLimit(dto: DeleteLimitDto) {
    return this.repo.deleteLimit!(dto);
  }

  async enrollAdmin(dto: EnrollDto) {
    const { deviceId, id } = await this.repo.enroll(dto)
    const signedToken = jwt.sign(
      { id: id, deviceId: deviceId },
      process.env.COOKIE_SIGN_SECRET!,
      { algorithm: 'HS256', expiresIn: '60d' }
    );

    return signedToken
  }

  async getEntitlementsByKey(dto: GetPlanByKeyDto): Promise<PlanEntitlements> {
    const agg = await this.repo.getPlanByKey(dto);
    if (!agg) throw new NotFoundException('Plan not found');

    return this.toEntitlements(agg);
  }

  private toEntitlements(agg: PlanAggregate): PlanEntitlements {
    const features: Record<string, boolean> = {};
    for (const f of agg.features) features[f.key] = !!f.enabled;

    const limits: Record<string, { soft?: number; hard?: number }> = {};
    for (const l of agg.limits) {
      limits[l.resource] = {
        ...(l.soft != null ? { soft: l.soft } : {}),
        ...(l.hard != null ? { hard: l.hard } : {}),
      };
    }
    return { features, limits };
  }
}