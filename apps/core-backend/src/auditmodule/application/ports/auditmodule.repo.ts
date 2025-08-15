export const AuditmoduleRepoToken = Symbol('AuditmoduleRepo');

export interface AuditmoduleRepo {
  list(): Promise<any[]>;
  get(id: string): Promise<any | null>;
  create(dto: any): Promise<any>;
}

