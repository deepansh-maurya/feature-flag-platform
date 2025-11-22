import { User } from '@prisma/client';
import { AuthEntity } from 'src/authmodule/domain/authmodule.entity';

export const AuthmoduleRepoToken = Symbol('AuthmoduleRepo');

export interface AuthmoduleRepo {
  register(user: AuthEntity): Promise<{ id: string; wid: string }>;
  login(user: AuthEntity): Promise<{
    id: string;
    wid: string;
    user: {
      id: string;
      email: string;
      name: string;
      isDeleted: boolean;
    };
    workspace: any;
  }>;
  get(id: string): Promise<{
    user: {
      id: string;
      email: string;
      name: string;
      isDeleted: boolean;
    };
    workspace: any;
  }>;
  logout(refreshToken: string): Promise<void>;
  changePassword(user: {
    password: string;
    confirmPassword: string;
  }): Promise<void>;
  delete(userId: string): Promise<void>;
  storeRefreshToken(
    userId: string,
    refreshToken: string,
    expiresAt: Date,
    workspaceId: string,
  ): Promise<void>;
  handleExternalLogin(
    provider: string,
    providerUserId: string,
    email: string,
    email_verified: boolean,
    rawProfile: JSON,
  ): Promise<{ id: string; wid: string }>
}
