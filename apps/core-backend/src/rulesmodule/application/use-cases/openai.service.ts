import { Injectable } from '@nestjs/common';

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
  async interpretRules(rawRules: string[]): Promise<any> {
    try {
      return await this.convertRuleToJson(rawRules);
    } catch (err) {
      throw new Error('Failed to parse OpenAI response as JSON', err);
    }
  }

  private async convertRuleToJson(naturalRule: string[]) {
    const prompt = this.buildPrompt(naturalRule);
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt,
        stream: false,
      }),
    });

    const data = await res.json();
    return JSON.parse(data.response);
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


