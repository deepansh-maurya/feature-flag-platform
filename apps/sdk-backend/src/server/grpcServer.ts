import * as grpc from "@grpc/grpc-js";
import { CacheUpdaterHandlers } from "./proto/generated/cache/CacheUpdater";
import { updateConfig, updateFlagRules } from "../cache/cacheOps";
import { ConfiUpdatorHandlers } from "./proto/generated/cache/ConfiUpdator";

export const ruleshandler: CacheUpdaterHandlers = {
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

      await updateFlagRules(flagId, JSON.parse(rules), version);

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

export const configHandler: ConfiUpdatorHandlers = {
  UpdateEnvConfig: async (call, callback) => {
    try {
      const { envId, envName, config } = call.request;
      if (!envId || !envName || !config) {
        return callback(
          {
            code: grpc.status.INVALID_ARGUMENT,
            message: "userId, envId, flagId, and rules are required"
          },
          null
        );
      }

      await updateConfig(envId, envName, config);
      return callback(null, {
        success: true,
        message: `config updated for envid=${envId},  envName=${envName}`
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
