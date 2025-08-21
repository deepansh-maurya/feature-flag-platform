export class ProjectEntity {
  private constructor(
    readonly id: string,
    readonly workspaceId: string,
    readonly name: string,
    readonly key: string,
    readonly createdAt?: Date,
    readonly updatedAt?: Date,
  ) {}

  static create(params: {
    id: string;
    workspaceId: string;
    name: string;
    key: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): ProjectEntity {
    if (!params.workspaceId || !params.name || !params.key) {
      throw new Error('workspaceId, name and key are required');
    }

    return new ProjectEntity(
      params.id,
      params.workspaceId,
      params.name,
      params.key,
      params.createdAt,
      params.updatedAt,
    );
  }
}
