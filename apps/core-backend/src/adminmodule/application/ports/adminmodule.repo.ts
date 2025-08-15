export const AdminmoduleRepoToken = Symbol('AdminmoduleRepo');

export interface AdminmoduleRepo {
  list(): Promise<any[]>;
  get(id: string): Promise<any | null>;
  create(dto: any): Promise<any>;
}

