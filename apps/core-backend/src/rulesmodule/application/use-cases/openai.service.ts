import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

export interface InterpretedRule {
  rawRule: string;
  interpretation: {
    field: string;
    operator: string;
    value: any;
  }[];
  combinator: 'and' | 'or';
}

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async interpretRules(rawRules: string[]): Promise<any> {
    const prompt = this.buildPrompt(rawRules);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a rule interpreter — respond ONLY with valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    });

    const content = response.choices?.[0]?.message?.content as
      | string
      | undefined;
    if (!content) throw new Error('No response from OpenAI');

    try {
      return JSON.parse(content);
    } catch (err) {
      throw new Error('Failed to parse OpenAI response as JSON', err);
    }
  }

  private buildPrompt(rawRules: string[]): string {
    return `
    Convert the following natural-language rules into a JSON object with keys "inputs" and "rules".

    - "inputs" must be an array of unique attribute names that the rules depend on.
    - "rules" must be an array of atomic rules. Each rule should include:

      - "id": a unique identifier for the rule (string, e.g. "rule_1")
      - "shortName": a short machine-friendly name for the rule (string, e.g. "plan_rule")
      - "rawRule": the original natural-language rule as given by the user
      - "field": the attribute name (string, e.g. "plan", "country", "age")
      - "op": the operator (one of: eq, neq, gt, gte, lt, lte, in, nin, contains, regex)
      - "value": the comparison value
      - "rollout": boolean (true if rollout should apply, false otherwise)

    Rules must be atomic (only one condition per rule).
    - If a rule contains multiple conditions in a single line (e.g., "if country=US and plan=premium"),
      split it into multiple separate rules, one per condition.
    - If a rule is deeply nested or cannot be split cleanly, return an error object like:
      { "error": "Only single-condition rules are allowed. Please simplify your rule." }

    Return ONLY valid JSON, no explanations.

    Rules:
    ${rawRules.map((r, i) => `- (${i + 1}) "${r.replace(/"/g, '\\"')}"`).join('\n')}
  `;
  }
}
