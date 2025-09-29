export const DeliverysyncmoduleRepoToken = Symbol('DeliverysyncmoduleRepo');

export interface DeliverysyncmoduleRepo {
  list(): Promise<any[]>;
  get(id: string): Promise<any | null>;
  create(dto: any): Promise<any>;
}
