export const NotificationsmoduleRepoToken = Symbol('NotificationsmoduleRepo');

export interface NotificationsmoduleRepo {
  list(): Promise<any[]>;
  get(id: string): Promise<any | null>;
  create(dto: any): Promise<any>;
}

