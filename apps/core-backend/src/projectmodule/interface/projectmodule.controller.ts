import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectmoduleService } from '../application/use-cases/projectmodule.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddEnvironmentDto,
  IssueSdkKeyDto,
  RevokeSdkKeyDto,
  RotateSdkKeyDto,
} from '../interface/dto/create-projectmodule.dto';
import { JwtAuthGuard } from 'src/authmodule/infrastructure/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectmoduleController {
  constructor(private readonly svc: ProjectmoduleService) {}

  /* -------------------- Projects -------------------- */
  @Post()
  createProject(@Body() dto: CreateProjectDto) {
    return this.svc.createProject(dto);
  }

  @Get(':id')
  getProjectById(@Param('id') id: string) {
    return this.svc.getProjectById(id);
  }

  @Get('by-key/:workspaceId/:key')
  getProjectByKey(
    @Param('workspaceId') workspaceId: string,
    @Param('key') key: string,
  ) {
    return this.svc.getProjectByKey(workspaceId, key);
  }

  @Get()
  listProjects(
    @Query('workspaceId') workspaceId: string,
    @Query('limit') limit = 20,
    @Query('cursor') cursor?: string,
  ) {
    return this.svc.listProjects(workspaceId, Number(limit), cursor);
  }

  @Patch(':id')
  updateProject(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.svc.updateProject({ ...dto, id });
  }

  /* ------------------ Environments ------------------ */
  @Post(':projectId/environments')
  addEnvironment(
    @Param('projectId') projectId: string,
    @Body() dto: AddEnvironmentDto,
  ) {
    return this.svc.addEnvironment({ ...dto, projectId });
  }

  @Get(':projectId/environments')
  listEnvironments(@Param('projectId') projectId: string) {
    return this.svc.listEnvironments(projectId);
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
