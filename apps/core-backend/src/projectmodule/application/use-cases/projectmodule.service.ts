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

  listProjects(workspaceId: string, limit: number, cursor?: string) {
    return this.repo.listProjects(workspaceId, limit, cursor);
  }

  updateProject(dto: UpdateProjectDto) {
    return this.repo.updateProject(dto);
  }

  deleteProject(id: string) {
    return this.repo.deleteProject(id);
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

  updateEnvironment(projectId: string, envId: string, patch: any) {
    return this.repo.updateEnvironment(projectId, envId, patch);
  }

  deleteEnvironment(projectId: string, envId: string) {
    return this.repo.deleteEnvironment(projectId, envId);
  }

  /* -------------------- SDK Keys -------------------- */
  issueSdkKey(dto: IssueSdkKeyDto) {
    return this.repo.issueSdkKey(dto);
  }

  async revokeSdkKey(dto: RevokeSdkKeyDto) {
    return await this.repo.revokeSdkKey(dto);
  }

  rotateSdkKey(dto: RotateSdkKeyDto) {
    return this.repo.rotateSdkKey(dto);
  }

  listSdkKeys(projectId: string, envKey?: string, type?: any) {
    return this.repo.listSdkKeys(projectId, envKey, type);
  }
}
