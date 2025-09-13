import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RulesmoduleService } from '../application/use-cases/rulesmodule.service';
import { EnvKey } from 'generated/prisma'
import { PublishRuleSetDto, UpsertRuleSetDto } from './dto/create-rulesmodule.dto';
import { JwtAuthGuard } from 'src/authmodule/infrastructure/guards/jwt-auth.guard';

// (optional) import your auth guard if you have one
// import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('rules')
export class RulesmoduleController {
  constructor(private readonly svc: RulesmoduleService) {}

  // ------------------------------------------------------------
  // Editor bootstrap (open Rules editor)
  // UI usage: on editor open to ensure a draft exists
  // ------------------------------------------------------------
  // @UseGuards(JwtAuthGuard)
  @Post(':flagId/:envKey/editor/bootstrap')
  async bootstrapEditor(
    @Param('flagId') flagId: string,
    @Param('envKey') envKey: EnvKey,
    @Body()
    body: {
      workspaceId: string;
      projectId: string;
      actorUserId: string;
    },
  ) {
    const draft = await this.svc.getOrCreateDraft({
      workspaceId: body.workspaceId,
      projectId: body.projectId,
      flagId,
      envKey,
      actorUserId: body.actorUserId,
    });
    return { draft };
  }

  // Convenience: fetch active + draft together (for editor header)
  // @UseGuards(JwtAuthGuard)
  @Get(':flagId/:envKey/editor/state')
  async getEditorState(
    @Param('flagId') flagId: string,
    @Param('envKey') envKey: EnvKey,
  ) {
    return this.svc.getEditorState(flagId, envKey);
  }

  // ------------------------------------------------------------
  // Loaders
  // ------------------------------------------------------------
  // @UseGuards(JwtAuthGuard)
  @Get(':flagId/:envKey/active')
  async getActive(
    @Param('flagId') flagId: string,
    @Param('envKey') envKey: EnvKey,
  ) {
    return this.svc.getActive(flagId, envKey);
  }

  // @UseGuards(JwtAuthGuard)
  @Get(':flagId/:envKey/draft')
  async getDraft(
    @Param('flagId') flagId: string,
    @Param('envKey') envKey: EnvKey,
  ) {
    return this.svc.getDraft(flagId, envKey);
  }

  // History drawer
  // @UseGuards(JwtAuthGuard)
  @Get(':flagId/:envKey/history')
  async listHistory(
    @Param('flagId') flagId: string,
    @Param('envKey') envKey: EnvKey,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    return this.svc.listHistory(flagId, envKey, Number(limit), Number(offset));
  }

  // ------------------------------------------------------------
  // Save draft (create/update rules, prerequisites, defaults)
  // UI: “Save” button
  // ------------------------------------------------------------
  // @UseGuards(JwtAuthGuard)
  @Put(':flagId/:envKey/draft')
  async saveDraft(
    @Param('flagId') flagId: string,
    @Param('envKey') envKey: EnvKey,
    @Body() body: UpsertRuleSetDto & {
      workspaceId: string;
      projectId: string;
      actorUserId: string;
    },
  ) {
    // ensure route and body agree on flag/env
    body.flagId = flagId;
    body.envKey = envKey;

    const saved = await this.svc.saveDraft({
      workspaceId: body.workspaceId,
      projectId: body.projectId,
      actorUserId: body.actorUserId,
      body,
    });
    return saved;
  }

  // ------------------------------------------------------------
  // Publish (archive old active → promote draft to active)
  // UI: “Publish” button
  // ------------------------------------------------------------
  // @UseGuards(JwtAuthGuard)
  @Post(':flagId/:envKey/publish')
  @HttpCode(HttpStatus.OK)
  async publish(
    @Param('flagId') flagId: string,
    @Param('envKey') envKey: EnvKey,
    @Body() body: (PublishRuleSetDto & { actorUserId: string }) | undefined,
  ) {
    const result = await this.svc.publish({
      flagId,
      envKey,
      actorUserId: body?.actorUserId ?? 'system',
      body,
    });
    return result;
  }

  // ------------------------------------------------------------
  // Validation tools (optional quick checks before publish)
  // ------------------------------------------------------------
  // @UseGuards(JwtAuthGuard)
  @Post(':flagId/:envKey/validate/segments')
  async validateSegments(
    @Param('flagId') flagId: string,
    @Param('envKey') envKey: EnvKey,
    @Body() body: { workspaceId: string },
  ) {
    return this.svc.validateDraftSegments(flagId, envKey, body.workspaceId);
  }

  // @UseGuards(JwtAuthGuard)
  @Post(':flagId/:envKey/validate/prereqs')
  async validatePrereqs(
    @Param('flagId') flagId: string,
    @Param('envKey') envKey: EnvKey,
    @Body() body: { projectId: string },
  ) {
    return this.svc.validateDraftPrereqs(flagId, envKey, body.projectId);
  }
}
