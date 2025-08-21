import { Module } from '@nestjs/common';
import PrismaService from 'src/infra/prisma/prisma.service';
import { CHANGEREQUEST_REPO } from './application/ports/changerequestsmodule.repo';
import { PrismaChangeRequestRepository } from './infrastructure/prisma/prisma-changerequestsmodule.repo';
import { ChangeRequestService } from './application/use-cases/changerequestsmodule.service';
import { ChangeRequestController } from './interface/changerequestsmodule.controller';

@Module({
  providers: [
    PrismaService,
    { provide: CHANGEREQUEST_REPO, useClass: PrismaChangeRequestRepository },
    ChangeRequestService,
  ],
  controllers: [ChangeRequestController],
  exports: [ChangeRequestService, CHANGEREQUEST_REPO],
})
export class ChangeRequestModule {}
