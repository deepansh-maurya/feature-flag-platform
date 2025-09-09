import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/authmodule/interface/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Allow routes marked @Public() to bypass auth.
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    return super.canActivate(context);
  }
    
  /**
   * Customize what happens after Passport runs the strategy.
   * If user is missing or an error occurred, throw 401.
   */
  handleRequest(err: any, user: any, _info: any, _context: any) {
    if (err || !user) {
      // _info can contain 'TokenExpiredError', 'No auth token', etc.
      throw err || new UnauthorizedException('Unauthorized user user');
    }
    return user; // attaches to req.user
  }
}


@Injectable()
export class RefreshAuthGuard extends AuthGuard('jwt-refresh') {}
