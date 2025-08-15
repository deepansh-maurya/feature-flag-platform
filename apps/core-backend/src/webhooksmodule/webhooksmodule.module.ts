import { Module } from '@nestjs/common';
import { WebhooksmoduleController } from './interface/webhooksmodule.controller';
import { WebhooksmoduleService } from './application/webhooksmodule.service';
import { WebhooksmoduleRepoToken } from './application/ports/webhooksmodule.repo';
import { PrismaWebhooksmoduleRepo } from './infrastructure/prisma/prisma-webhooksmodule.repo';

@Module({
  controllers: [WebhooksmoduleController],
  providers: [
    WebhooksmoduleService,
    { provide: WebhooksmoduleRepoToken, useClass: PrismaWebhooksmoduleRepo },
  ],
  exports: [WebhooksmoduleService],
})
export class WebhooksmoduleModule {}

