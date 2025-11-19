import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AuthmoduleRepo, AuthmoduleRepoToken } from '../ports/authmodule.repo';
import { AuthEntity } from 'src/authmodule/domain/authmodule.entity';
import * as jwt from 'jsonwebtoken';
import qs from 'qs';
import {
  LoginDto,
  RefreshDto,
  RegisterDto,
} from 'src/authmodule/interface/dto/create-authmodule.dto';
import { CookieOptions } from 'express';
import axios from 'axios';
@Injectable()
export class AuthmoduleService {
  constructor(
    @Inject(AuthmoduleRepoToken) private readonly repo: AuthmoduleRepo,
    private readonly GOOGLE_CLIENT_ID = process.env.GOOGLE_CONSOLE_CLIENT_ID,
    private readonly GOOGLE_CLIENT_SECRET = process.env
      .GOOGLE_CONSOLE_CLIENT_SECRET,
    private readonly BASE_URL = process.env.BASE_URL,
    private readonly GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID,
    private readonly GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET,
  ) {}

  async register(data: RegisterDto) {
    const user = AuthEntity.create(data);
    const result = await this.repo.register(user);
    return await this.issueTokens(result.id, result.wid);
  }

  async login(data: LoginDto) {
    const user = AuthEntity.create(data);
    const result = await this.repo.login(user);
    console.log(result, 20);

    return {
      ...(await this.issueTokens(result.id, result.wid)),
      user: result.user,
      workspace: result.workspace,
    };
  }

  async getUser(id: string) {
    return await this.repo.get(id);
  }

  async refreshToken(data: RefreshDto) {
    return this.issueTokens(data.userId, data.workspaceId);
  }

  async logout(data: string) {
    await this.repo.logout(data);
  }

  async delete(data: string) {
    await this.repo.delete(data);
  }

  async changePassword(data: {
    userId: string;
    password: string;
    confirmPassword: string;
  }) {
    await this.repo.changePassword(data);
  }

  private async issueTokens(userId: string, workspaceId: string) {
    // Access token
    const accessToken = jwt.sign(
      { sub: userId, wid: workspaceId },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' },
    );

    // Refresh token
    const refreshToken = jwt.sign(
      { sub: userId, wid: workspaceId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' },
    );

    // Persist refresh token (hashed)
    await this.repo.storeRefreshToken(
      userId,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      workspaceId,
    );

    return { accessToken, refreshToken };
  }

  refreshCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/', // scope if you want; or '/'
      maxAge: 15 * 24 * 60 * 60 * 1000, // align with refresh exp
      // domain: '.yourdomain.com' // set when using subdomains
    };
  }

  async exchangeCodeForToken(
    provider: 'google' | 'github',
    code: string,
    code_verifier?: string,
  ) {
    if (provider === 'google') {
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const payload = {
        client_id: this.GOOGLE_CLIENT_ID,
        client_secret: this.GOOGLE_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${this.BASE_URL}/auth/google/callback`,
        ...(code_verifier ? { code_verifier } : {}),
      };
      const r = await axios.post(tokenUrl, qs.stringify(payload), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return r.data;
    } else {
      const tokenUrl = 'https://github.com/login/oauth/access_token';
      const payload: any = {
        client_id: this.GITHUB_CLIENT_ID,
        client_secret: this.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${this.BASE_URL}/auth/github/callback`,
        ...(code_verifier ? { code_verifier } : {}),
      };
      const r = await axios.post(tokenUrl, qs.stringify(payload), {
        headers: { Accept: 'application/json' },
      });
      return r.data;
    }
  }

  async fetchProfile(provider: 'google' | 'github', tokens: any) {
    if (provider === 'google') {
      const r = await axios.get(
        'https://openidconnect.googleapis.com/v1/userinfo',
        { headers: { Authorization: `Bearer ${tokens.access_token}` } },
      );
      return {
        providerUserId: r.data.sub,
        email: r.data.email,
        email_verified: Boolean(r.data.email_verified),
        name: r.data.name,
        raw: r.data,
      };
    } else {
      const r = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          'User-Agent': 'featureflag-app',
        },
      });
      let email = r.data.email;
      let email_verified = false;
      if (!email) {
        const e = await axios.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            'User-Agent': 'featureflag-app',
          },
        });
        const primary =
          e.data.find((it: any) => it.primary && it.verified) ||
          e.data.find((it: any) => it.verified);
        if (primary) {
          email = primary.email;
          email_verified = Boolean(primary.verified);
        }
      } else {
        email_verified = true;
      }
      return {
        providerUserId: String(r.data.id),
        email,
        email_verified,
        name: r.data.name || r.data.login,
        raw: r.data,
      };
    }
  }

  async oauthCallback(
    provider: 'google' | 'github',
    code: string,
    code_verifier: string,
    returnTo: string,
  ) {
    const tokens = await this.exchangeCodeForToken(
      provider,
      String(code),
      code_verifier || undefined,
    );

    const profile = await this.fetchProfile(provider, tokens);
    if (!profile.providerUserId) throw new Error('missing provider user id');
    if (!profile.email) {
      return new BadRequestException(
        'Provider did not return email. Please use another login method or provide email.',
      );
    }

    const user = await this.repo.handleExternalLogin(
      provider,
      profile.providerUserId,
      profile.email,
      profile.email_verified,
      profile.raw,
      tokens,
    );

    const session = await this.createSessionForUser(user);

    return session;
  }
}
