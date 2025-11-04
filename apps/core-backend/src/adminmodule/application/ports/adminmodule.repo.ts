import { Plan, PlanFeature, PlanLimit, Price } from '@prisma/client';
import {
  ArchivePlanDto,
  CreatePlanDto,
  DeleteFeatureDto,
  DeleteLimitDto,
  DeletePriceDto,
  EnrollDto,
  GetPlanByIdDto,
  GetPlanByKeyDto,
  ListPlansDto,
  PublishPlanDto,
  SetPriceActiveDto,
  UpsertFeaturesDto,
  UpsertLimitsDto,
  UpsertPriceDto,
} from 'src/adminmodule/interface/dto/create-adminmodule.dto';

// Aggregate return shape
export type PlanAggregate = Plan & {
  prices: Price[];
  features: PlanFeature[];
  limits: PlanLimit[];
};

export interface AdminmoduleRepo {
  // Commands
  createPlan(dto: CreatePlanDto): Promise<PlanAggregate>;
  publishPlan(dto: PublishPlanDto): Promise<void>;
  archivePlan(dto: ArchivePlanDto): Promise<void>;

  // Queries
  getPlanById(dto: GetPlanByIdDto): Promise<PlanAggregate | null>;
  getPlanByKey(dto: GetPlanByKeyDto): Promise<PlanAggregate | null>;
  listPlans(dto?: ListPlansDto): Promise<PlanAggregate[]>;

  // Optional editors (V2)
  upsertPrice?(dto: UpsertPriceDto): Promise<Price>;
  setPriceActive?(dto: SetPriceActiveDto): Promise<void>;

  upsertFeatures?(dto: UpsertFeaturesDto): Promise<PlanFeature[]>;
  upsertLimits?(dto: UpsertLimitsDto): Promise<PlanLimit[]>;

  deletePrice?(dto: DeletePriceDto): Promise<void>;
  deleteFeature?(dto: DeleteFeatureDto): Promise<void>;
  deleteLimit?(dto: DeleteLimitDto): Promise<void>;

  // admin auth routes
  enroll(dto: EnrollDto): Promise<{ deviceId: string; id: string }>;
}
