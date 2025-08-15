import { Module } from '@nestjs/common';
import { AuthmoduleController } from './interface/authmodule.controller';
import { AuthmoduleService } from './application/authmodule.service';
import { AuthmoduleRepoToken } from './application/ports/authmodule.repo';
import { PrismaAuthmoduleRepo } from './infrastructure/prisma/prisma-authmodule.repo';

@Module({
  controllers: [AuthmoduleController],
  providers: [
    AuthmoduleService,
    { provide: AuthmoduleRepoToken, useClass: PrismaAuthmoduleRepo },
  ],
  exports: [AuthmoduleService],
})
export class AuthmoduleModule {}

