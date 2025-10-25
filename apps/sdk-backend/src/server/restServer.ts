import { Request, Response } from "express";
import { evaluateRules } from "../core/evaluator";
import { redis } from "../cache/redisClient";

export async function handleEvaluator(req: Request, res: Response) {
  try {
    const { flagId, context } = req.body;

    if (!context || !flagId) {
      return res.status(400).json({ error: "userId and context are required" });
    }

    const redisKey = `flag:${flagId}:rules`;
    const cachedRules = await redis.get(redisKey);
    if (!cachedRules) {
      return res.status(404).json({ error: "No rules found for this flag" });
    }
    const { rules } = JSON.parse(cachedRules);
    const results = evaluateRules(rules, context);

    return res.json({
      success: true,
      results
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
}

export async function getCOnfigForEnv(req: Request, res: Response) {
  try {
    const { envId, envName } = req.body;
    if (!envId || !envName) {
      return res.status(400).json({ error: "env id and name required " });
    }

    const config = await redis.get(`env:${envId}:${envName}`);

    if (!config)
      return res
        .status(404)
        .json({ error: "not config present for this env id and name" });

    return res.status(200).json({ config: config });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
}
