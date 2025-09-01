import { AuthEntity } from "src/authmodule/domain/authmodule.entity";

export const AuthmoduleRepoToken = Symbol('AuthmoduleRepo');

export interface AuthmoduleRepo {
  register(user: AuthEntity): Promise<{id:string,wid:string}>
  login(user: AuthEntity): Promise<string>
  logout(refreshToken: string): Promise<void>
  changePassword(user: { password: string, confirmPassword: string }): Promise<void>
  delete(userId: string): Promise<void>
  storeRefreshToken(userId: string, refreshToken: string, expiresAt: Date, workspaceId: string): Promise<void>
}

