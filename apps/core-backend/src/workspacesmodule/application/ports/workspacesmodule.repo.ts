export const WorkspacesmoduleRepoToken = Symbol('WorkspacesmoduleRepo');

export interface WorkspacesmoduleRepo {
  list(): Promise<any[]>;
  get(id: string): Promise<any | null>;
  create(dto: any): Promise<any>;
}

