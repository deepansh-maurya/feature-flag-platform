export const WebhooksmoduleRepoToken = Symbol('WebhooksmoduleRepo');

export interface WebhooksmoduleRepo {
  list(): Promise<any[]>;
  get(id: string): Promise<any | null>;
  create(dto: any): Promise<any>;
}

