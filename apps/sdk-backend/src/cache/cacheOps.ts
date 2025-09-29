import { redis } from "./redisClient";

export async function updateFlagRules(
  flagId: string,
  rules: string,
  version?: number
) {
  const key = `flag:${flagId}:rules`;
  const value = JSON.stringify({ ...JSON.parse(rules) as any, version: version || 1 });
  await redis.set(key, value);
}
