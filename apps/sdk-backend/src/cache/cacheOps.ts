import { redis } from "./redisClient";

export async function updateFlagRules(
  userId: string,
  envId: string,
  flagId: string,
  rules: object,
  version?: number
) {
  const key = `user:${userId}:env:${envId}:flag:${flagId}`;
  const value = JSON.stringify({ rules, version: version || 1 });
  await redis.set(key, value);
}
