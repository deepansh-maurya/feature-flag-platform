export const AnalyticsmoduleRepoToken = Symbol('AnalyticsmoduleRepo');

export interface AnalyticsmoduleRepo {
  list(): Promise<any[]>;
  get(id: string): Promise<any | null>;
  create(dto: any): Promise<any>;
}

