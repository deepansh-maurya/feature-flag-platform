export const UsersmoduleRepoToken = Symbol('UsersmoduleRepo');

export interface UsersmoduleRepo {
  list(): Promise<any[]>;
  get(id: string): Promise<any | null>;
  create(dto: any): Promise<any>;
}

