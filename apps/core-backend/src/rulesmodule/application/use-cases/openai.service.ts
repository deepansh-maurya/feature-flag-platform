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
    this.openai = new OpenAI({ apiKey: this.configService.get<string>('OPENAI_API_KEY') });
  }

  async interpretRules(rawRules: string[]): Promise<any> {
    const prompt = this.buildPrompt(rawRules);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a rule interpreter — respond ONLY with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    });

    const content = response.choices?.[0]?.message?.content as string | undefined;
    if (!content) throw new Error('No response from OpenAI');

    try {
      return JSON.parse(content);
    } catch (err) {
      throw new Error('Failed to parse OpenAI response as JSON');
    }
  }

  private buildPrompt(rawRules: string[]): string {
    return `Convert the following natural-language rules into a JSON object with keys \"inputs\" and \"rules\".\nRules:\n${rawRules
      .map((r) => `- "${r.replace(/"/g, '\\"')}"`)
      .join('\n')}\n\nEach rule in \"rules\" should include: rawRule, kind (allow|deny), match (with array under \"all\" of cond objects {attr, op, value}), and outcome. Return only valid JSON.`;
  }
}