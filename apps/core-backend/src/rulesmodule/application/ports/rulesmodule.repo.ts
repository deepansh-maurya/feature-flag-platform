export const RulesmoduleRepoToken = Symbol('RulesmoduleRepo');

export interface RulesmoduleRepo {
  list(): Promise<any[]>;
  get(id: string): Promise<any | null>;
  create(dto: any): Promise<any>;
}

