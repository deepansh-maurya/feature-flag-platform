import * as grpc from "@grpc/grpc-js";
import { CacheUpdaterHandlers } from "./proto/generated/cache/CacheUpdater";
import { updateFlagRules } from "../cache/cacheOps";

export const handler: CacheUpdaterHandlers = {
  UpdateFlagRules: async (call, callback) => {
    try {
      const { userId, envId, flagId, rules, version } = call.request;

      if (!userId || !envId || !flagId || !rules) {
        return callback(
          {
            code: grpc.status.INVALID_ARGUMENT,
            message: "userId, envId, flagId, and rules are required"
          },
          null
        );
      }

      await updateFlagRules(userId, envId, flagId, JSON.parse(rules), version);

      return callback(null, {
        success: true,
        message: `Rules updated for user=${userId}, env=${envId}, flag=${flagId}`
      });
    } catch (err: any) {
      return callback(
        {
          code: grpc.status.INTERNAL,
          message: err.message || "Failed to update rules"
        },
        null
      );
    }
  }
};