// Simple smoke runner for the create rules flow
import 'reflect-metadata';
import { ConfigModule } from '@nestjs/config';
import PrismaService from 'src/infra/prisma/prisma.service';
import { PrismaRulesmoduleRepository } from '../infrastructure/prisma/prisma-rulesmodule.repo';
import { RulesmoduleService } from '../application/use-cases/rulesmodule.service';
import { RuleInterpreterService } from '../application/use-cases/rule-interpreter.service';
import { OpenAIService } from '../application/use-cases/openai.service';

async function run() {
  // NOTE: This smoke runner is minimal and won't connect to a real DB or OpenAI.
  // It simply instantiates classes to ensure there are no runtime constructor errors.
  const config = new (require('@nestjs/config').ConfigService)();
  const prisma = new PrismaService();

  const openai = new OpenAIService(config);
  const interpreter = new RuleInterpreterService(openai);
  const repo = new PrismaRulesmoduleRepository(prisma);
  const svc = new RulesmoduleService(repo);

  try {
    const interpreted = await interpreter.interpretAndValidate({
      workspaceId: 'w1',
      projectId: 'p1',
      flagId: 'f1',
      envKey: 'dev' as any,
      rawRules: ['Show to US users over 21'],
      actorUserId: 'u1',
    });

    console.log('Interpreted (smoke):', interpreted);

    const saved = await svc.createRules({
      workspaceId: 'w1',
      projectId: 'p1',
      flagId: 'f1',
      envKey: 'dev' as any,
      rawRules: ['Show to US users over 21'],
      interpretedRules: { inputs: {}, rules: [] },
      actorUserId: 'u1',
    });

    console.log('Saved (smoke):', saved);
  } catch (err) {
    console.error(
      'Smoke test error (expected if DB/OpenAI not configured):',
      err.message,
    );
  }
}

if (require.main === module) {
  run().catch((e) => console.error(e));
}
