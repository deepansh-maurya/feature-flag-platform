import { Module } from '@nestjs/common';
import { AdminmoduleController } from './interface/adminmodule.controller';
import { AdminmoduleRepoToken, AdminmoduleService } from './application/use-cases/adminmodule.service';
import { PrismaAdminmoduleRepo } from './infrastructure/prisma/prisma-adminmodule.repo';
import PrismaService from 'src/infra/prisma/prisma.service';

@Module({
  controllers: [AdminmoduleController],
  providers: [
        PrismaService,
    
    AdminmoduleService,
    { provide: AdminmoduleRepoToken, useClass: PrismaAdminmoduleRepo },
  ],
  exports: [AdminmoduleService],
})
export class Adminmodule {}

