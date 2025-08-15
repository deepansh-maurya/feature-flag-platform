import { Module } from '@nestjs/common';
import { AdminmoduleController } from './interface/adminmodule.controller';
import { AdminmoduleService } from './application/adminmodule.service';
import { AdminmoduleRepoToken } from './application/ports/adminmodule.repo';
import { PrismaAdminmoduleRepo } from './infrastructure/prisma/prisma-adminmodule.repo';

@Module({
  controllers: [AdminmoduleController],
  providers: [
    AdminmoduleService,
    { provide: AdminmoduleRepoToken, useClass: PrismaAdminmoduleRepo },
  ],
  exports: [AdminmoduleService],
})
export class AdminmoduleModule {}

