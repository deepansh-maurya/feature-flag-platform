import { Inject, Injectable } from '@nestjs/common';
import { AuthmoduleRepo, AuthmoduleRepoToken } from '../ports/authmodule.repo';
import { AuthEntity } from 'src/authmodule/domain/authmodule.entity';
import * as jwt from "jsonwebtoken";
@Injectable()
export class AuthmoduleService {
  constructor(@Inject(AuthmoduleRepoToken) private readonly repo: AuthmoduleRepo) { }

  async register(data: AuthEntity) {
    const user = AuthEntity.create(data)
    const id = await this.repo.register(user)
    return this.issueTokens(id, { sub: id })


  }

  async login(data: AuthEntity) {
    const user = AuthEntity.create(data)
    const id = await this.repo.login(user)

    return this.issueTokens(id, { sub: id })
  }

  async logout(data: string) {
    await this.repo.logout(data)
  }

  async delete(data: string) {
    await this.repo.delete(data)
  }

  async changePassword(data: { password: string, confirmPassword: string }) {
    await this.repo.changePassword(data)
  }

  private async issueTokens(userId: string, payload: object) {
    // Access token
    const accessToken = jwt.sign(
      { sub: userId, ...payload },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    // Refresh token
    const refreshToken = jwt.sign(
      { sub: userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    // Persist refresh token (hashed)
    await this.repo.storeRefreshToken(
      userId,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    return { accessToken, refreshToken };
  }

}

