import { Module } from '@nestjs/common';
import { DeliverysyncmoduleController } from './interface/deliverysyncmodule.controller';
import { DeliverysyncmoduleService } from './application/deliverysyncmodule.service';
import { DeliverysyncmoduleRepoToken } from './application/ports/deliverysyncmodule.repo';
import { PrismaDeliverysyncmoduleRepo } from './infrastructure/prisma/prisma-deliverysyncmodule.repo';

@Module({
  controllers: [DeliverysyncmoduleController],
  providers: [
    DeliverysyncmoduleService,
    { provide: DeliverysyncmoduleRepoToken, useClass: PrismaDeliverysyncmoduleRepo },
  ],
  exports: [DeliverysyncmoduleService],
})
export class DeliverysyncmoduleModule {}

