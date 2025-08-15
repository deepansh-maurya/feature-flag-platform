export const SdkkeysmoduleRepoToken = Symbol('SdkkeysmoduleRepo');

export interface SdkkeysmoduleRepo {
  list(): Promise<any[]>;
  get(id: string): Promise<any | null>;
  create(dto: any): Promise<any>;
}

