import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProjectmoduleService } from '../application/use-cases/projectmodule.service';
import {
  CreateProjectDto,
  CreateProjectRequestDto,
  UpdateProjectDto,
  AddEnvironmentDto,
  IssueSdkKeyDto,
  RevokeSdkKeyDto,
  RotateSdkKeyDto,
} from '../interface/dto/create-projectmodule.dto';
import { JwtAuthGuard } from 'src/authmodule/infrastructure/guards/jwt-auth.guard';
import { Request } from 'express';

interface CRequest extends Request {
  workspaceId: string;
}

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectmoduleController {
  constructor(private readonly svc: ProjectmoduleService) {}

  @Post()
  createProject(@Body() dto: CreateProjectRequestDto, @Req() req: Request) {
    const { workspaceId } = req.user as any;
    const incoming = dto as any;
    // normalize langSupport: allow clients to send JSON string, comma-separated, or array
    if (incoming.langSupport && !Array.isArray(incoming.langSupport)) {
      try {
        incoming.langSupport = JSON.parse(incoming.langSupport as any);
      } catch (e) {
        // fallback: split comma-separated
        if (typeof incoming.langSupport === 'string') {
          incoming.langSupport = incoming.langSupport
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
        }
      }
    }

    const payload: CreateProjectDto = {
      ...(incoming as any),
      workspaceId: workspaceId as string,
    };
    return this.svc.createProject(payload);
  }

  @Get(':id')
  getProjectById(@Param('id') id: string) {
    return this.svc.getProjectById(id);
  }

  @Get()
  listProjects(
    @Req() req: CRequest,
    @Query('limit') limit = 20,
    @Query('cursor') cursor?: string,
  ) {
    return this.svc.listProjects(req.workspaceId, Number(limit), cursor);
  }

  @Patch(':id')
  updateProject(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    const incoming = dto as any;
    if (incoming.langSupport && !Array.isArray(incoming.langSupport)) {
      try {
        incoming.langSupport = JSON.parse(incoming.langSupport as any);
      } catch (e) {
        if (typeof incoming.langSupport === 'string') {
          incoming.langSupport = incoming.langSupport
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
        }
      }
    }
    return this.svc.updateProject({ ...incoming, id });
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string) {
    await this.svc.deleteProject(id);
    // returning void -> Nest will respond with 200 by default; prefer 204 for delete but keep simple
    return;
  }

  /* ------------------ Environments ------------------ */
  @Post(':projectId/environments')
  addEnvironment(
    @Param('projectId') projectId: string,
    @Body() dto: AddEnvironmentDto,
  ) {
    console.log(projectId, ' ', dto, 97);

    return this.svc.addEnvironment({ ...dto, projectId });
  }

  @Get(':projectId/environments')
  listEnvironments(@Param('projectId') projectId: string) {
    return this.svc.listEnvironments(projectId);
  }

  @Patch(':projectId/environments/:envId')
  updateEnvironment(
    @Param('projectId') projectId: string,
    @Param('envId') envId: string,
    @Body() dto: any,
  ) {
    return this.svc.updateEnvironment(projectId, envId, dto);
  }

  @Delete(':projectId/environments/:envId')
  deleteEnvironment(
    @Param('projectId') projectId: string,
    @Param('envId') envId: string,
  ) {
    return this.svc.deleteEnvironment(projectId, envId);
  }

  /* -------------------- SDK Keys -------------------- */
  @Post(':projectId/sdk-keys')
  issueSdkKey(
    @Param('projectId') projectId: string,
    @Body() dto: IssueSdkKeyDto,
  ) {
    return this.svc.issueSdkKey({ ...dto, projectId });
  }

  @Post('sdk-keys/revoke')
  revokeSdkKey(@Body() dto: RevokeSdkKeyDto) {
    return this.svc.revokeSdkKey(dto);
  }

  @Post('sdk-keys/rotate')
  rotateSdkKey(@Body() dto: RotateSdkKeyDto) {
    return this.svc.rotateSdkKey(dto);
  }
}
