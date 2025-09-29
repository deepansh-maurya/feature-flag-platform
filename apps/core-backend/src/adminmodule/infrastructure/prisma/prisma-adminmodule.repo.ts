import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AdminmoduleRepo,
  PlanAggregate,
} from '../../application/ports/adminmodule.repo';
import PrismaService from 'src/infra/prisma/prisma.service';
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
import { PlanStatus } from 'generated/prisma';
import * as bcrypt from 'bcrypt';

type DbPlanAgg = any;

@Injectable()
export class PrismaAdminmoduleRepo implements AdminmoduleRepo {
  constructor(private readonly db: PrismaService) {}

  // ---------- helpers ----------
  private toAggregate(p: DbPlanAgg): PlanAggregate {
    const { prices, features, limits, ...plan } = p;
    return {
      ...plan,
      description: plan.description ?? null,
      prices: prices.map((x: any) => ({ ...x })),
      features: features.map((x: any) => ({ ...x })),
      limits: limits.map((x: any) => ({ ...x })),
    };
  }

  private includeChildren() {
    return { prices: true, features: true, limits: true };
  }

  // ---------- Commands ----------
  async createPlan(dto: CreatePlanDto): Promise<PlanAggregate> {
    return this.db.$transaction(async (tx) => {
      const exists = await tx.plan.findUnique({ where: { key: dto.key } });
      if (exists) throw new BadRequestException('Plan key already exists');

      const plan = await tx.plan.create({
        data: {
          key: dto.key.trim(),
          name: dto.name.trim(),
          description: dto.description ?? null,
          trialDays: dto.trialDays ?? 0,
          status: PlanStatus.draft,
          prices: {
            create: dto.prices.map((p) => ({
              recurringInterval: p.recurringInterval,
              currency: p.currency.trim().toLowerCase(),
              unitAmountCents: p.unitAmountCents,
              isMetered: p.isMetered ?? false,
              meterKey: p.meterKey ?? null,
              active: p.active ?? true,
            })),
          },
          features: {
            create: (dto.features ?? []).map((f) => ({
              key: f.key.trim(),
              enabled: !!f.enabled,
              notes: f.notes ?? null,
            })),
          },
          limits: {
            create: (dto.limits ?? []).map((l) => ({
              resource: l.resource.trim(),
              soft: l.soft ?? null,
              hard: l.hard ?? null,
            })),
          },
        },
        include: this.includeChildren(),
      });

      return this.toAggregate(plan);
    });
  }

  async publishPlan(dto: PublishPlanDto): Promise<void> {
    const plan = await this.db.plan.findUnique({
      where: { id: dto.planId },
      include: { prices: { where: { active: true } } },
    });
    if (!plan) throw new NotFoundException('Plan not found');
    if (!plan.prices.length) {
      throw new BadRequestException(
        'Plan must have at least one active price to publish',
      );
    }
    if (plan.status === PlanStatus.archived) {
      throw new BadRequestException('Archived plan cannot be published');
    }
    await this.db.plan.update({
      where: { id: dto.planId },
      data: { status: PlanStatus.active },
    });
  }

  async archivePlan(dto: ArchivePlanDto): Promise<void> {
    const plan = await this.db.plan.findUnique({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundException('Plan not found');
    await this.db.plan.update({
      where: { id: dto.planId },
      data: { status: PlanStatus.archived },
    });
  }

  // ---------- Queries ----------
  async getPlanById(dto: GetPlanByIdDto): Promise<PlanAggregate | null> {
    const plan = await this.db.plan.findUnique({
      where: { id: dto.planId },
      include: this.includeChildren(),
    });
    return plan ? this.toAggregate(plan) : null;
  }

  async getPlanByKey(dto: GetPlanByKeyDto): Promise<PlanAggregate | null> {
    const plan = await this.db.plan.findUnique({
      where: { key: dto.planKey },
      include: this.includeChildren(),
    });
    return plan ? this.toAggregate(plan) : null;
  }

  async listPlans(dto?: ListPlansDto): Promise<PlanAggregate[]> {
    const where = dto?.status ? { status: dto.status } : {};
    const plans = await this.db.plan.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: this.includeChildren(),
    });
    return plans.map((p) => this.toAggregate(p));
  }

  // ---------- Optional editors (V2) ----------
  async upsertPrice(dto: UpsertPriceDto) {
    // Find by (planId, interval, currency). If exists -> update; else -> create.
    const existing = await this.db.price.findFirst({
      where: {
        planId: dto.planId,
        recurringInterval: dto.recurringInterval,
        currency: dto.currency.trim().toLowerCase(),
      },
    });

    if (existing) {
      return this.db.price.update({
        where: { id: existing.id },
        data: {
          unitAmountCents: dto.unitAmountCents,
          isMetered: dto.isMetered ?? existing.isMetered,
          meterKey: dto.meterKey ?? existing.meterKey,
          stripeProductId: dto.stripeProductId ?? existing.stripeProductId,
          stripePriceId: dto.stripePriceId ?? existing.stripePriceId,
          active: dto.active ?? existing.active,
        },
      });
    }

    return this.db.price.create({
      data: {
        planId: dto.planId,
        recurringInterval: dto.recurringInterval,
        currency: dto.currency.trim().toLowerCase(),
        unitAmountCents: dto.unitAmountCents,
        isMetered: dto.isMetered ?? false,
        meterKey: dto.meterKey ?? null,
        stripeProductId: dto.stripeProductId ?? null,
        stripePriceId: dto.stripePriceId ?? null,
        active: dto.active ?? true,
      },
    });
  }

  async setPriceActive(dto: SetPriceActiveDto): Promise<void> {
    const exists = await this.db.price.findFirst({
      where: { id: dto.priceId, planId: dto.planId },
    });
    if (!exists) throw new NotFoundException('Price not found for plan');
    await this.db.price.update({
      where: { id: dto.priceId },
      data: { active: dto.active },
    });
  }

  async upsertFeatures(dto: UpsertFeaturesDto) {
    return this.db.$transaction(async (tx) => {
      const results: any = [];
      for (const item of dto.items) {
        const res = await tx.planFeature.upsert({
          where: { planId_key: { planId: dto.planId, key: item.key } },
          create: {
            planId: dto.planId,
            key: item.key.trim(),
            enabled: !!item.enabled,
            notes: item.notes ?? null,
          },
          update: {
            enabled: !!item.enabled,
            notes: item.notes ?? null,
          },
        });
        results.push(res);
      }
      return results;
    });
  }

  async upsertLimits(dto: UpsertLimitsDto) {
    return this.db.$transaction(async (tx) => {
      const results: any = [];
      for (const item of dto.items) {
        const res = await tx.planLimit.upsert({
          where: {
            planId_resource: { planId: dto.planId, resource: item.resource },
          },
          create: {
            planId: dto.planId,
            resource: item.resource.trim(),
            soft: item.soft ?? null,
            hard: item.hard ?? null,
          },
          update: {
            soft: item.soft ?? null,
            hard: item.hard ?? null,
          },
        });
        results.push(res);
      }
      return results;
    });
  }

  async deletePrice(dto: DeletePriceDto): Promise<void> {
    const exists = await this.db.price.findFirst({
      where: { id: dto.priceId, planId: dto.planId },
    });
    if (!exists) throw new NotFoundException('Price not found for plan');
    await this.db.price.delete({ where: { id: dto.priceId } });
  }

  async deleteFeature(dto: DeleteFeatureDto): Promise<void> {
    await this.db.planFeature.delete({
      where: { planId_key: { planId: dto.planId, key: dto.key } },
    });
  }

  async deleteLimit(dto: DeleteLimitDto): Promise<void> {
    await this.db.planLimit.delete({
      where: {
        planId_resource: { planId: dto.planId, resource: dto.resource },
      },
    });
  }

  async enroll(dto: EnrollDto): Promise<{ deviceId: string; id: string }> {
    const admin = await this.db.admin.findFirst();
    const ok = await bcrypt.compare(dto.passKey, admin?.passKey!);

    if (!ok) {
      throw new UnauthorizedException('Invalid passkey');
    }
    const deviceId = crypto.randomUUID();
    await this.db.admin.update({
      where: { id: admin?.id },
      data: { deviceId: deviceId, isUsable: false },
    });

    return { deviceId, id: admin?.id! };
  }
}
