import crypto from "crypto";

export interface Rule {
  id: string;
  shortName: string;
  rawRule: string;
  field: string;
  op:   
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "in"
    | "nin"
    | "contains"
    | "regex";
  value: any;
  rollout: boolean;
  rolloutPercent: number;
}

export type RuleSet = Rule[];

export type EvaluationContext = {
  userId: string;
  [key: string]: any;
};

export type EvaluationResult = Record<string, boolean>;

export function evaluateRules(
  rules: RuleSet,
  context: EvaluationContext
): EvaluationResult {
  const results: EvaluationResult = {};

  for (const rule of rules) {
    const fieldValue = context[rule.field];

    let match = false;

    switch (rule.op) {
      case "eq":
        match = fieldValue === rule.value;
        break;
      case "neq":
        match = fieldValue !== rule.value;
        break;
      case "gt":
        match = typeof fieldValue === "number" && fieldValue > rule.value;
        break;
      case "gte":
        match = typeof fieldValue === "number" && fieldValue >= rule.value;
        break;
      case "lt":
        match = typeof fieldValue === "number" && fieldValue < rule.value;
        break;
      case "lte":
        match = typeof fieldValue === "number" && fieldValue <= rule.value;
        break;
      case "in":
        match = Array.isArray(rule.value) && rule.value.includes(fieldValue);
        break;
      case "nin":
        match = Array.isArray(rule.value) && !rule.value.includes(fieldValue);
        break;
      case "contains":
        match =
          (typeof fieldValue === "string" && fieldValue.includes(rule.value)) ||
          (Array.isArray(fieldValue) && fieldValue.includes(rule.value));
        break;
      case "regex":
        match = new RegExp(rule.value).test(fieldValue);
        break;
      default:
        throw new Error(`Unsupported operator: ${rule.op}`);
    }

    if (match && rule.rollout) {
      const hash = crypto
        .createHash("sha1")
        .update(context.userId + rule.id)
        .digest("hex");
      const bucket = parseInt(hash.substring(0, 8), 16) % 100;
      match = bucket < rule.rolloutPercent;
    }

    results[rule.shortName] = match;
  }

  return results;
}
