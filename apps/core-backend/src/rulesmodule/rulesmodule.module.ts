import { Module } from '@nestjs/common';
import { RulesmoduleController } from './interface/rulesmodule.controller';
import { RulesmoduleRepoToken } from './application/ports/rulesmodule.repo';
import { PrismaRulesmoduleRepository } from './infrastructure/prisma/prisma-rulesmodule.repo';
import { RulesmoduleService } from './application/use-cases/rulesmodule.service';

@Module({
  controllers: [RulesmoduleController],
  providers: [
    RulesmoduleService,
    { provide: RulesmoduleRepoToken, useClass: PrismaRulesmoduleRepository },
  ],
  exports: [RulesmoduleService],
})
export class RulesmoduleModule {}