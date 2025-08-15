export const BillingmoduleRepoToken = Symbol('BillingmoduleRepo');

export interface BillingmoduleRepo {
  list(): Promise<any[]>;
  get(id: string): Promise<any | null>;
  create(dto: any): Promise<any>;
}

