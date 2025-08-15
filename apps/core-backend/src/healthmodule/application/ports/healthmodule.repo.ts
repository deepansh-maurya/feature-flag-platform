export const HealthmoduleRepoToken = Symbol('HealthmoduleRepo');

export interface HealthmoduleRepo {
  list(): Promise<any[]>;
  get(id: string): Promise<any | null>;
  create(dto: any): Promise<any>;
}

