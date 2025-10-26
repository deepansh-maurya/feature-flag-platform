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
  config: string,
  type: "env" | "flags" | "rules"
) {
  try {
    const key = `env:${envId}:${envName}`;
    const isValueAvail = await redis.get(key);

    if (!isValueAvail) {
      const newConfig: {
        envs: any[];
        flags: any[];
        rules: any[];
      } = {
        envs: [],
        flags: [],
        rules: []
      };

      if (type == "env") {
        newConfig.envs.push(config);
      } else if (type == "rules") {
        newConfig.rules.push(config);
      } else if (type == "flags") {
        newConfig.flags.push(config);
      }

      const value = JSON.stringify(newConfig);
      await redis.set(key, value);
    } else {
      if (type == "env") {
        const parsedConfig: {
          envs: any[];
          flags: any[];
          rules: any[];
        } = JSON.parse(isValueAvail);

        const envs = parsedConfig.envs;

        const isEnvAvail = envs.some((env) => env.id == JSON.parse(config).id);

        if (isEnvAvail) {
          parsedConfig.envs.push(config);
          await redis.set(key, JSON.stringify(parsedConfig));
        }
      } else if (type == "rules") {
        const parsedConfig: {
          envs: any[];
          flags: any[];
          rules: any[];
        } = JSON.parse(isValueAvail);

        const rules = parsedConfig.rules;

        const isEnvAvail = rules.some((rule) => rule.id == JSON.parse(config).id);

        if (isEnvAvail) {
          parsedConfig.rules.push(config);
          await redis.set(key, JSON.stringify(parsedConfig));
        }
      } else if (type == "flags") {
        const parsedConfig: {
          envs: any[];
          flags: any[];
          rules: any[];
        } = JSON.parse(isValueAvail);

        const flags = parsedConfig.flags;

        const isEnvAvail = flags.some((flag) => flag.id == JSON.parse(config).id);

        if (isEnvAvail) {
          parsedConfig.flags.push(config);
          await redis.set(key, JSON.stringify(parsedConfig));
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export async function updateUsersApiKeys(apiKey: string, userId: string) {
  try {
    const key = `user:${apiKey}`;
    await redis.set(key, userId);
  } catch (error) {
    console.log(error);
  }
}
