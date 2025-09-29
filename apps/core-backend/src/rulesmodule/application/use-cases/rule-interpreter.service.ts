/* eslint-disable */
import { BadRequestException, Injectable } from '@nestjs/common';
import { RuleSetRecord } from '../ports/rulesmodule.repo';
import { EnvKey } from 'generated/prisma';
import { OpenAIService } from './openai.service';

export interface InterpretRulesInput {
  workspaceId: string;
  projectId: string;
  flagId: string;
  envKey: EnvKey;
  rawRules: string[];
  actorUserId: string;
}

@Injectable()
export class RuleInterpreterService {
  constructor(private readonly openAIService: OpenAIService) {}

  async interpretAndValidate(
    input: InterpretRulesInput,
  ): Promise<Pick<RuleSetRecord, 'rules'>> {
    const { rawRules } = input;

    // Validate input
    if (!Array.isArray(rawRules) || rawRules.length === 0) {
      throw new BadRequestException(
        'rawRules must be a non-empty array of strings',
      );
    }

    // Get interpretation from OpenAI
    const interpreted = (await this.openAIService.interpretRules(
      rawRules,
    )) as any;

    // Validate the response structure
    // this.validateInterpretedRules(interpreted);

    // Return just the rules part for storage
    return {
      rules: interpreted.rules,
    };
  }

  // private validateInterpretedRules(interpreted: any) {
  //   if (!interpreted || typeof interpreted !== 'object') {
  //     throw new BadRequestException('Invalid LLM response structure');
  //   }

  //   if (!interpreted.inputs || !interpreted.rules) {
  //     throw new BadRequestException('LLM response missing required sections');
  //   }

  //   if (!Array.isArray(interpreted.rules)) {
  //     throw new BadRequestException('rules must be an array');
  //   }

  //   // Validate each rule has required structure
  //   interpreted.rules.forEach((rule: any, idx: number) => {
  //     if (!rule.kind || !['allow', 'deny'].includes(rule.kind)) {
  //       throw new BadRequestException(`Invalid rule kind at index ${idx}`);
  //     }

  //     if (!rule.match || typeof rule.match !== 'object') {
  //       throw new BadRequestException(
  //         `Invalid match condition at index ${idx}`,
  //       );
  //     }

  //     if (rule.outcome && typeof rule.outcome !== 'object') {
  //       throw new BadRequestException(`Invalid outcome at index ${idx}`);
  //     }
  //   });
  // }
}
