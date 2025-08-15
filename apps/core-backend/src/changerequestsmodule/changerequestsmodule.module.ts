import { Module } from '@nestjs/common';
import { ChangerequestsmoduleController } from './interface/changerequestsmodule.controller';
import { ChangerequestsmoduleService } from './application/changerequestsmodule.service';
import { ChangerequestsmoduleRepoToken } from './application/ports/changerequestsmodule.repo';
import { PrismaChangerequestsmoduleRepo } from './infrastructure/prisma/prisma-changerequestsmodule.repo';

@Module({
  controllers: [ChangerequestsmoduleController],
  providers: [
    ChangerequestsmoduleService,
    { provide: ChangerequestsmoduleRepoToken, useClass: PrismaChangerequestsmoduleRepo },
  ],
  exports: [ChangerequestsmoduleService],
})
export class ChangerequestsmoduleModule {}

