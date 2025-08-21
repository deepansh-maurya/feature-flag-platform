import { Inject, Injectable } from '@nestjs/common';
import {
  ProjectmoduleRepo,
  ProjectmoduleRepoToken,
} from '../ports/projectmodule.repo';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddEnvironmentDto,
  IssueSdkKeyDto,
  RevokeSdkKeyDto,
  RotateSdkKeyDto,
} from '../../interface/dto/create-projectmodule.dto';

@Injectable()
export class ProjectmoduleService {
  constructor(
    @Inject(ProjectmoduleRepoToken)
    private readonly repo: ProjectmoduleRepo,
  ) {}

  /* -------------------- Projects -------------------- */
  createProject(dto: CreateProjectDto) {
    return this.repo.createProject(dto);
  }

  getProjectById(id: string) {
    return this.repo.findProjectById(id);
  }

  getProjectByKey(workspaceId: string, key: string) {
    return this.repo.findProjectByKey(workspaceId, key);
  }

  listProjects(workspaceId: string, limit: number, cursor?: string) {
    return this.repo.listProjects(workspaceId, limit, cursor);
  }

  updateProject(dto: UpdateProjectDto) {
    return this.repo.updateProject(dto);
  }

  /* ------------------ Environments ------------------ */
  addEnvironment(dto: AddEnvironmentDto) {
    return this.repo.addEnvironment(dto);
  }

  listEnvironments(projectId: string) {
    return this.repo.listEnvironments(projectId);
  }

  findEnvironment(projectId: string, envKey: string) {
    return this.repo.findEnvironment(projectId, envKey);
  }

  /* -------------------- SDK Keys -------------------- */
  issueSdkKey(dto: IssueSdkKeyDto) {
    return this.repo.issueSdkKey(dto);
  }

  revokeSdkKey(dto: RevokeSdkKeyDto) {
    return this.repo.revokeSdkKey(dto);
  }

  rotateSdkKey(dto: RotateSdkKeyDto) {
    return this.repo.rotateSdkKey(dto);
  }

  listSdkKeys(projectId: string, envKey?: string, type?: any) {
    return this.repo.listSdkKeys(projectId, envKey, type);
  }
}
