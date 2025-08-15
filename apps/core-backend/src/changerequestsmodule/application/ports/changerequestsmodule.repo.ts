export const ChangerequestsmoduleRepoToken = Symbol('ChangerequestsmoduleRepo');

export interface ChangerequestsmoduleRepo {
  list(): Promise<any[]>;
  get(id: string): Promise<any | null>;
  create(dto: any): Promise<any>;
}

