import * as grpc from "@grpc/grpc-js";
import { CacheUpdaterHandlers } from "./proto/generated/cache/CacheUpdater";
import {
  updateConfig,
  updateFlagRules,
  updateUsersApiKeys
} from "../cache/cacheOps";
import { ConfiUpdatorHandlers } from "./proto/generated/cache/ConfiUpdator";
import { ApiKeyUpdatorHandlers } from "./proto/generated/cache/ApiKeyUpdator";

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
      const { envId, envName, config, type } = call.request;
      if (!envId || !envName || !config) {
        return callback(
          {
            code: grpc.status.INVALID_ARGUMENT,
            message: " envId, envName, and config are required"
          },
          null
        );
      }

      await updateConfig(envId, envName, config, type as any);
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

export const apiKeyHandler: ApiKeyUpdatorHandlers = {
  UpdateApiKey: async (call, callback) => {
    try {
      const { apiKey, userId } = call.request;
      if (!apiKey || !userId) {
        return callback(
          {
            code: grpc.status.INVALID_ARGUMENT,
            message: " apiKey, userId are required"
          },
          null
        );
      }

      await updateUsersApiKeys(apiKey, userId);

      return callback(null, {
        success: true,
        message: `config updated for apiKey=${apiKey},  userId=${userId}`
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
