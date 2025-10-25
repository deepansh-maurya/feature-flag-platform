import { redis } from "./redisClient";

export async function updateFlagRules(
  flagId: string,
  rules: string,
  version?: number
) {
  try {
    const key = `flag:${flagId}:rules`;
    const value = JSON.stringify({
      ...(JSON.parse(rules) as any),
      version: version || 1
    });
    await redis.set(key, value);
  } catch (error) {
    console.log(error);
  }
}

export async function updateConfig(
  envId: string,
  envName: string,  
  config: string
) {
  try {
    const key = `env:${envId}:${envName}`;
    const value = JSON.stringify({ ...JSON.parse(config) });
    await redis.set(key, value);
  } catch (error) {}
}
