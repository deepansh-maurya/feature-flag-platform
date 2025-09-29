import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RulesmoduleController } from './interface/rulesmodule.controller';
import { RulesmoduleRepoToken } from './application/ports/rulesmodule.repo';
import { PrismaRulesmoduleRepository } from './infrastructure/prisma/prisma-rulesmodule.repo';
import { RulesmoduleService } from './application/use-cases/rulesmodule.service';
import { RuleInterpreterService } from './application/use-cases/rule-interpreter.service';
import { OpenAIService } from './application/use-cases/openai.service';
import PrismaService from 'src/infra/prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [RulesmoduleController],
  providers: [
    PrismaService,
    RulesmoduleService,
    RuleInterpreterService,
    OpenAIService,
    { provide: RulesmoduleRepoToken, useClass: PrismaRulesmoduleRepository },
  ],
  exports: [RulesmoduleService],
})
export class RulesmoduleModule {}
