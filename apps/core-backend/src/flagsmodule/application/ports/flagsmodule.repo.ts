export const FlagsmoduleRepoToken = Symbol('FlagsmoduleRepo');

export interface FlagsmoduleRepo {
  list(): Promise<any[]>;
  get(id: string): Promise<any | null>;
  create(dto: any): Promise<any>;
}

