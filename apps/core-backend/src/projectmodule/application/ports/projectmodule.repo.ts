import { SdkKeyType } from 'generated/prisma'
import {
  ProjectSummaryDto,
  EnvironmentDto,
  SdkKeyDto,
  CreateProjectDto,
  UpdateProjectDto,
  AddEnvironmentDto,
  IssueSdkKeyDto,
  RevokeSdkKeyDto,
  RotateSdkKeyDto,
  ListProjectsResultDto,
} from '../../interface/dto/create-projectmodule.dto';

export const ProjectmoduleRepoToken = Symbol('ProjectmoduleRepo');

export interface ProjectmoduleRepo {
  // Projects
  createProject(input: CreateProjectDto): Promise<ProjectSummaryDto>;
  findProjectById(id: string): Promise<ProjectSummaryDto | null>;
  listProjects(
    workspaceId: string,
    limit: number,
    cursor?: string,
  ): Promise<ListProjectsResultDto>;
  updateProject(input: UpdateProjectDto): Promise<ProjectSummaryDto>;
  deleteProject(id: string): Promise<void>;

  // Environments
  addEnvironment(input: AddEnvironmentDto): Promise<EnvironmentDto>;
  listEnvironments(projectId: string): Promise<EnvironmentDto[]>;
  findEnvironment(projectId: string, envKey: string): Promise<EnvironmentDto | null>;

  // SDK Keys
  issueSdkKey(input: IssueSdkKeyDto): Promise<SdkKeyDto>;
  revokeSdkKey(input: RevokeSdkKeyDto): Promise<void>;
  rotateSdkKey(input: RotateSdkKeyDto): Promise<{ newKey: SdkKeyDto; oldKey?: SdkKeyDto }>;
  listSdkKeys(projectId: string, envKey?: string, type?: SdkKeyType): Promise<SdkKeyDto[]>;
}
