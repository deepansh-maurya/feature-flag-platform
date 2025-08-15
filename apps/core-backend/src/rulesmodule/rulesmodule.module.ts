import { Module } from '@nestjs/common';
import { RulesmoduleController } from './interface/rulesmodule.controller';
import { RulesmoduleService } from './application/rulesmodule.service';
import { RulesmoduleRepoToken } from './application/ports/rulesmodule.repo';
import { PrismaRulesmoduleRepo } from './infrastructure/prisma/prisma-rulesmodule.repo';

@Module({
  controllers: [RulesmoduleController],
  providers: [
    RulesmoduleService,
    { provide: RulesmoduleRepoToken, useClass: PrismaRulesmoduleRepo },
  ],
  exports: [RulesmoduleService],
})
export class RulesmoduleModule {}

