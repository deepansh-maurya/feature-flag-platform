import { Module } from '@nestjs/common';
import { AuthmoduleController } from './interface/authmodule.controller';
import { AuthmoduleService } from './application/use-cases/authmodule.service';
import { AuthmoduleRepoToken } from './application/ports/authmodule.repo';
import { PrismaAuthmoduleRepo } from './infrastructure/prisma/prisma-authmodule.repo';
import PrismaService from 'src/infra/prisma/prisma.service';
import { PrismaWorkspacesmoduleRepo } from 'src/workspacesmodule/infrastructure/prisma/prisma-workspacesmodule.repo';
import { WorkspacesmoduleRepoToken } from 'src/workspacesmodule/application/ports/workspacesmodule.repo';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthmoduleController],
  providers: [
    PrismaService,
    AuthmoduleService,
    { provide: AuthmoduleRepoToken, useClass: PrismaAuthmoduleRepo },
    { provide: WorkspacesmoduleRepoToken, useClass: PrismaWorkspacesmoduleRepo },
    JwtAuthGuard
  ],
  exports: [AuthmoduleService, JwtAuthGuard],
})
export class Authmodule { }