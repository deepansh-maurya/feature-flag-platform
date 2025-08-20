import { Inject, Injectable } from '@nestjs/common';
import { AuthmoduleRepo, AuthmoduleRepoToken } from '../ports/authmodule.repo';
import { AuthEntity } from 'src/authmodule/domain/authmodule.entity';
import * as jwt from "jsonwebtoken";
import { LoginDto, RegisterDto } from 'src/authmodule/interface/dto/create-authmodule.dto';
@Injectable()
export class AuthmoduleService {
  constructor(@Inject(AuthmoduleRepoToken) private readonly repo: AuthmoduleRepo) { }

  async register(data: RegisterDto) {
    const user = AuthEntity.create(data)
    const id = await this.repo.register(user)
    //TODO create workspace after account
    return this.issueTokens(id, { sub: id },data.workspaceId)
  }

  async login(data: LoginDto) {
    const user = AuthEntity.create(data)
    const id = await this.repo.login(user)

    return this.issueTokens(id, { sub: id },data.workspaceId)
  }

  async logout(data: string) {
    await this.repo.logout(data)
  }

  async delete(data: string) {
    await this.repo.delete(data)
  }

  async changePassword(data: { userId: string, password: string, confirmPassword: string }) {
    await this.repo.changePassword(data)
  }

  private async issueTokens(userId: string, payload: object,workspaceId: string) {
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
      workspaceId
    );

    return { accessToken, refreshToken };
  }

}

