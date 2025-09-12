import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import PrismaService from 'src/infra/prisma/prisma.service';
import { USER_REPO } from 'src/usersmodule/application/ports/usersmodule.repo';
import { PrismaUserRepository } from 'src/usersmodule/infrastructure/prisma/prisma-usersmodule.repo';
import {
  WorkspacesmoduleRepo,
  WorkspacesmoduleRepoToken,
} from 'src/workspacesmodule/application/ports/workspacesmodule.repo';
import { sha256 } from '../prisma/prisma-authmodule.repo';
import * as jwt from 'jsonwebtoken';
export interface JwtPayload extends Request {
  sub: string;
  email: string;
  role: string;
  wid: string;
  iat: number;
  eat: string;
}

function fromCookie(cookieName: string) {
  return (req: any) => req.cookies?.[cookieName] || null;
}

@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(USER_REPO) private readonly user: PrismaUserRepository,
    @Inject(WorkspacesmoduleRepoToken)
    private readonly workspace: WorkspacesmoduleRepo,
  ) {
    super({
      // Try header first, then cookie (adjust if you only use one)
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        fromCookie('access_token'),
      ]),
      secretOrKey: process.env.JWT_SECRET!, // set in env
      ignoreExpiration: false,
    });
  }

  /**
   * Runs ONLY after signature/expiry checks pass.
   * Whatever you return here becomes `req.user`.
   */
  async validate(payload: JwtPayload) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.user.findById(payload.sub);

    if (!user || user.isDeleted) {
      throw new UnauthorizedException('User disabled');
    }

    const workspace = await this.workspace.get({ id: payload.wid });

    if (!workspace) throw new UnauthorizedException('User disabled');
    console.log('auth check passed');

    return {
      userId: payload.sub,
      email: payload.email,
      workspaceId: payload.wid,
      roles: payload.role ?? [],
    };
  }
}

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(USER_REPO) private readonly user: PrismaUserRepository,
    @Inject(WorkspacesmoduleRepoToken)
    private readonly workspace: WorkspacesmoduleRepo,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        fromCookie('refresh'),
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const comingToken = req.cookies?.refresh;

    if (!comingToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const verified = jwt.verify(comingToken, process.env.JWT_REFRESH_SECRET!);

    const token = await this.prisma.refreshToken.findFirst({
      where: {
        userId: verified.sub as string,
        workspaceId: (verified as any).wid,
        tokenHash: sha256(comingToken),
      },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    const user = await this.user.findById(verified.sub as string);
    if (!user || user.isDeleted) {
      throw new UnauthorizedException('User disabled');
    }

    const workspace = await this.workspace.get({ id: (verified as any).wid });
    if (!workspace) throw new UnauthorizedException('Workspace missing');

    return {
      userId: verified.sub,
      email: (verified as any).email,
      workspaceId: workspace.id,
    };
  }
}
