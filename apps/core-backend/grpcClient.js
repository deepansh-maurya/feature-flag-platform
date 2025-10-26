"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFlagCache = UpdateFlagCache;
exports.UpdateConfig = UpdateConfig;
exports.UpdateApiKey = UpdateApiKey;
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path_1 = require("path");
const PROTO_PATH = path_1.default.resolve(__dirname, './protos/cache.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH);
const grpcObj = grpc.loadPackageDefinition(packageDef);
const target = process.env.SDK_BACKEND_GRPC_TARGET || 'localhost:50051';
const flagClient = new grpcObj.cache.CacheUpdater(target, grpc.credentials.createInsecure());
const configClient = new grpcObj.cache.ConfiUpdator(target, grpc.credentials.createInsecure());
const apiKeyClient = new grpcObj.cache.ApiKeyUpdator(target, grpc.credentials.createInsecure());
function UpdateFlagCache(flagId, rules) {
    return new Promise((resolve, reject) => {
        flagClient.UpdateFlagRules({ envId: '', flagId, rules, userId: '', version: 1 }, (err, res) => {
            if (err)
                return reject(err);
            resolve(res);
        });
    });
}
function UpdateConfig(envId, envName, config) {
    return new Promise((resolve, reject) => {
        configClient.UpdateEnvConfig({ config, envId, envName }, (err, res) => {
            if (err)
                return reject(err);
            resolve(res);
        });
    });
}
function UpdateApiKey(apiKey, userId) {
    return new Promise((resolve, reject) => {
        apiKeyClient.UpdateApiKey({ apiKey, userId }, (err, res) => {
            if (err)
                return reject(err);
            resolve(res);
        });
    });
}
//# sourceMappingURL=grpcClient.js.map