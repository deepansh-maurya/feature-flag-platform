import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RulesmoduleService } from '../application/use-cases/rulesmodule.service';
import { JwtAuthGuard } from 'src/authmodule/infrastructure/guards/jwt-auth.guard';
import { RuleInterpreterService } from '../application/use-cases/rule-interpreter.service';
import { CreateRulesmoduleDto } from './dto/create-rulesmodule.dto';

@UseGuards(JwtAuthGuard)
@Controller('rules')
export class RulesmoduleController {
  constructor(
    private readonly svc: RulesmoduleService,
    private readonly interpreter: RuleInterpreterService,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createRules(@Body() dto: CreateRulesmoduleDto) {
    // First interpret and validate rules
    const interpreted = await this.interpreter.interpretAndValidate({
      workspaceId: dto.workspaceId,
      projectId: dto.projectId,
      flagId: dto.flagId,
      envKey: dto.envKey,
      rawRules: dto.rawRules,
      actorUserId: dto.actorUserId,
    });

    // Persist draft with interpreted rules (store the full interpreted object)
    const saved = await this.svc.createRules({
      workspaceId: dto.workspaceId,
      projectId: dto.projectId,
      flagId: dto.flagId,
      envKey: dto.envKey,
      rawRules: dto.rawRules,
      interpretedRules: interpreted,
      actorUserId: dto.actorUserId,
      previousRuleSetId: dto.previousRuleSetId,
    });

    // Return saved record along with the interpreted rules
    return { saved, interpreted };
  }
}
