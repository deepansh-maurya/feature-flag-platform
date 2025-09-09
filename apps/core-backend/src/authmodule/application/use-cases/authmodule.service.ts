import { Inject, Injectable } from '@nestjs/common';
import { AuthmoduleRepo, AuthmoduleRepoToken } from '../ports/authmodule.repo';
import { AuthEntity } from 'src/authmodule/domain/authmodule.entity';
import * as jwt from "jsonwebtoken";
import { LoginDto, RefreshDto, RegisterDto } from 'src/authmodule/interface/dto/create-authmodule.dto';
import { CookieOptions } from 'express';
@Injectable()
export class AuthmoduleService {
  constructor(@Inject(AuthmoduleRepoToken) private readonly repo: AuthmoduleRepo) { }

  async register(data: RegisterDto) {
    const user = AuthEntity.create(data)
    const result = await this.repo.register(user)
    return await this.issueTokens(result.id, { sub: result.id, workspaceId: result.wid }, result.wid)
  }

  async login(data: LoginDto) {
    const user = AuthEntity.create(data)
    const result = await this.repo.login(user)
    console.log(result, 20);

    return await this.issueTokens(result.id, { sub: result.id, workspaceId: result.wid }, result.wid) 
  }

  async refreshToken(data: RefreshDto) {
    return this.issueTokens(data.userId, { sub: data.userId, email: data.email }, data.workspaceId)
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

  private async issueTokens(userId: string, payload: object, workspaceId: string) {
    // Access token
    const accessToken = jwt.sign(
      { sub: userId, ...payload },
      process.env.JWT_SECRET!,
      { expiresIn: "1m" },
    );

    // Refresh token
    const refreshToken = jwt.sign(
      { sub: userId, ...payload },
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

  refreshCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',        // scope if you want; or '/'
      maxAge: 15 * 24 * 60 * 60 * 1000, // align with refresh exp
      // domain: '.yourdomain.com' // set when using subdomains
    };
  }


}

