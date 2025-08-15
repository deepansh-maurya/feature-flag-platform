export const AuthmoduleRepoToken = Symbol('AuthmoduleRepo');

export interface AuthmoduleRepo {
  list(): Promise<any[]>;
  get(id: string): Promise<any | null>;
  create(dto: any): Promise<any>;
}

