import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { AdminmoduleService } from '../application/use-cases/adminmodule.service';
import { ArchivePlanDto, CreatePlanDto, DeleteFeatureDto, DeleteLimitDto, DeletePriceDto, EnrollDto, GetPlanByIdDto, GetPlanByKeyDto, ListPlansDto, PublishPlanDto, SetPriceActiveDto, UpsertFeaturesDto, UpsertLimitsDto, UpsertPriceDto } from './dto/create-adminmodule.dto';
import { Response } from 'express';

// @UseGuards(SuperAdminGuard)
@Controller('super-admin/plans')
export class AdminmoduleController {
  constructor(private readonly svc: AdminmoduleService) { }

  // ---------- Commands ----------
  @Post()
  create(@Body() dto: CreatePlanDto) {
    return this.svc.createPlan(dto);
  }

  @Post(':planId/publish')
  publish(@Param('planId') planId: string) {
    const dto = new PublishPlanDto();
    dto.planId = planId;
    return this.svc.publishPlan(dto);
  }

  @Patch(':planId/archive')
  archive(@Param('planId') planId: string) {
    const dto = new ArchivePlanDto();
    dto.planId = planId;
    return this.svc.archivePlan(dto);
  }

  // ---------- Queries ----------
  @Get()
  list(@Query() q: ListPlansDto) {
    return this.svc.listPlans(q);
  }

  @Get(':planId')
  getById(@Param('planId') planId: string) {
    const dto = new GetPlanByIdDto();
    dto.planId = planId;
    return this.svc.getPlanById(dto);
  }

  @Get('key/:planKey')
  getByKey(@Param('planKey') planKey: string) {
    const dto = new GetPlanByKeyDto();
    dto.planKey = planKey;
    return this.svc.getPlanByKey(dto);
  }

  @Get('key/:planKey/entitlements')
  entitlements(@Param('planKey') planKey: string) {
    const dto = new GetPlanByKeyDto();
    dto.planKey = planKey;
    return this.svc.getEntitlementsByKey(dto);
  }

  // ---------- Editors (optional/V2) ----------
  @Post(':planId/prices')
  upsertPrice(@Param('planId') planId: string, @Body() body: UpsertPriceDto) {
    body.planId = planId;
    return this.svc.upsertPrice(body);
  }

  @Patch(':planId/prices/:priceId/active')
  setPriceActive(
    @Param('planId') planId: string,
    @Param('priceId') priceId: string,
    @Body() body: { active: boolean },
  ) {
    const dto = new SetPriceActiveDto();
    dto.planId = planId;
    dto.priceId = priceId;
    dto.active = !!body.active;
    return this.svc.setPriceActive(dto);
  }

  @Put(':planId/features')
  upsertFeatures(@Param('planId') planId: string, @Body() body: UpsertFeaturesDto) {
    body.planId = planId;
    return this.svc.upsertFeatures(body);
  }

  @Put(':planId/limits')
  upsertLimits(@Param('planId') planId: string, @Body() body: UpsertLimitsDto) {
    body.planId = planId;
    return this.svc.upsertLimits(body);
  }

  @Delete(':planId/prices/:priceId')
  deletePrice(@Param('planId') planId: string, @Param('priceId') priceId: string) {
    const dto = new DeletePriceDto();
    dto.planId = planId;
    dto.priceId = priceId;
    return this.svc.deletePrice(dto);
  }

  @Delete(':planId/features/:key')
  deleteFeature(@Param('planId') planId: string, @Param('key') key: string) {
    const dto = new DeleteFeatureDto();
    (dto as any).planId = planId; // if your DTO includes planId; else adapt
    dto.key = key;
    return this.svc.deleteFeature(dto);
  }

  @Delete(':planId/limits/:resource')
  deleteLimit(@Param('planId') planId: string, @Param('resource') resource: string) {
    const dto = new DeleteLimitDto();
    (dto as any).planId = planId; // if your DTO includes planId; else adapt
    dto.resource = resource;
    return this.svc.deleteLimit(dto);
  }

  @Post("enroll")
  async enrollAdmin(@Body() body: EnrollDto, @Res() res: Response) {
    const token = await this.svc.enrollAdmin(body)
    res.cookie('admin_td', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 60,
    });
    return res.json({ ok: true });
  }

}
