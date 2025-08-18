import { Module } from '@nestjs/common';
import { AuthmoduleController } from './interface/authmodule.controller';
import { AuthmoduleService } from './application/use-cases/authmodule.service';
import { AuthmoduleRepoToken } from './application/ports/authmodule.repo';
import { PrismaAuthmoduleRepo } from './infrastructure/prisma/prisma-authmodule.repo';
import PrismaService from 'src/infra/prisma/prisma.service';

@Module({
  controllers: [AuthmoduleController],
  providers: [
    PrismaService,
    AuthmoduleService,
    { provide: AuthmoduleRepoToken, useClass: PrismaAuthmoduleRepo },
  ],
  exports: [AuthmoduleService],
})
export class Authmodule {}

