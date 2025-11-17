import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UseGuards,
  Version,
} from '@nestjs/common';
import crypto from 'crypto';
import qs from 'qs';

import { AuthmoduleService } from '../application/use-cases/authmodule.service';
import {
  ChangePasswordDto,
  DeleteUserDto,
  LoginDto,
  LogoutDto,
  RegisterDto,
} from './dto/create-authmodule.dto';
import { Public } from './decorators/public.decorator';
import {
  JwtAuthGuard,
  RefreshAuthGuard,
} from '../infrastructure/guards/jwt-auth.guard';
import { JwtPayload } from '../infrastructure/strategy/jwt.strategy';
import { Request, Response } from 'express';
import Redis from 'ioredis';

@Controller({ path: 'auth', version: '1' })
export class AuthmoduleController {
  private redis: Redis;
  constructor(
    private readonly svc: AuthmoduleService,
    private readonly REDIS_URL = process.env.REDIS_URL,
    private readonly BASE_URL = process.env.BASE_URL,
    private readonly GOOGLE_CLIENT_ID = process.env.GOOGLE_CONSOLE_CLIENT_ID,
    private readonly GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID,
  ) {
    this.redis = new Redis(REDIS_URL!);
  }

  genRandomBase64Url(bytes = 32) {
    return crypto.randomBytes(bytes).toString('base64url');
  }

  sha256Base64Url(input: string) {
    return Buffer.from(
      crypto.createHash('sha256').update(input).digest(),
    ).toString('base64url');
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refreshAccessToken(@Req() req: Request & JwtPayload) {
    const { userId, email, workspaceId } = req.user as any;

    return this.svc.refreshToken({ userId, email, workspaceId });
  }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    console.log(dto, 16);

    const { accessToken, refreshToken } = await this.svc.register(dto);
    res.cookie('refresh', refreshToken, this.svc.refreshCookieOptions());
    console.log('end');

    return res.json({ accessToken });
  }

  @Get('ping')
  ping() {
    console.log('HIT /auth/ping');
    return { ok: true };
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    console.log(dto, 16);

    const { accessToken, refreshToken, user, workspace } =
      await this.svc.login(dto);
    console.log(accessToken, refreshToken, 47);

    res.cookie('refresh', refreshToken, this.svc.refreshCookieOptions());
    console.log('end');

    return res.json({ accessToken, user, workspace });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body() dto: LogoutDto) {
    return this.svc.logout(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req: JwtPayload, @Body() dto: ChangePasswordDto) {
    return this.svc.changePassword({ userId: req.sub, ...dto });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async delete(@Body() dto: DeleteUserDto) {
    return this.svc.delete(dto.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async get(@Req() req: Request & JwtPayload) {
    const { userId, email, workspaceId } = req.user as any;
    return this.svc.getUser(userId);
  }

  buildGoogleAuthUrl({
    state,
    code_challenge,
  }: {
    state: string;
    code_challenge?: string;
  }) {
    const params: Record<string, string> = {
      client_id: this.GOOGLE_CLIENT_ID!,
      redirect_uri: `${this.BASE_URL}/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      state,
    };
    if (code_challenge) {
      params['code_challenge'] = code_challenge;
      params['code_challenge_method'] = 'S256';
    }
    return `https://accounts.google.com/o/oauth2/v2/auth?${qs.stringify(params)}`;
  }

  buildGithubAuthUrl({
    state,
    code_challenge,
  }: {
    state: string;
    code_challenge?: string;
  }) {
    const params: Record<string, string> = {
      client_id: this.GITHUB_CLIENT_ID!,
      redirect_uri: `${this.BASE_URL}/auth/github/callback`,
      scope: 'read:user user:email',
      state,
    };
    if (code_challenge) {
      params['code_challenge'] = code_challenge;
      params['code_challenge_method'] = 'S256';
    }
    return `https://github.com/login/oauth/authorize?${qs.stringify(params)}`;
  }

  @Get('auth/:provider')
  @Redirect(undefined, 302)
  async oauth(
    @Param('provider') provider: string,
    @Query('returnTo') returnTo: string,
  ) {
    const allowedReturnTo = '/app'
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const providerRaw = String(provider || '').toLowerCase();
    if (providerRaw !== 'google' && providerRaw !== 'github')
      return new BadRequestException('unsupported provider');

    const requestedReturnTo = String(returnTo || '');
    const returnToPath = allowedReturnTo.includes(requestedReturnTo)
      ? requestedReturnTo
      : allowedReturnTo[0] || '/';

    const state = this.genRandomBase64Url(32);

    let code_verifier: string | undefined;
    let code_challenge: string | undefined;
    const pkceEnabled = false;
    if (pkceEnabled) {
      code_verifier = this.genRandomBase64Url(64);
      code_challenge = this.sha256Base64Url(code_verifier);
    }

    const meta = {
      provider: providerRaw,
      returnToPath,
      createdAt: Date.now(),
      code_verifier: code_verifier || '',
    };

    await this.redis.set(
      `oauth:state:${state}`,
      JSON.stringify(meta),
      'EX',
      900,
    );

    return providerRaw === 'google'
      ? this.buildGoogleAuthUrl({ state, code_challenge })
      : this.buildGithubAuthUrl({ state, code_challenge });
  }
}
