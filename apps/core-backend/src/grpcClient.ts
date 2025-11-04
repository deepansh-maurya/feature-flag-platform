import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import { ProtoGrpcType } from './proto/generated/cache';
import { CacheUpdaterClient } from './proto/generated/cache/CacheUpdater';
import { ConfiUpdatorClient } from './proto/generated/cache/ConfiUpdator';
import { ApiKeyUpdatorClient } from './proto/generated/cache/ApiKeyUpdator';


const PROTO_PATH = path.resolve(__dirname, './proto/cache.proto');

const packageDef = protoLoader.loadSync(PROTO_PATH);


const grpcObj = grpc.loadPackageDefinition(
  packageDef,
) as unknown as ProtoGrpcType;

const target = process.env.SDK_BACKEND_GRPC_TARGET || 'localhost:50051';

const flagClient = new grpcObj.cache.CacheUpdater(
  target,
  grpc.credentials.createInsecure(),
) as unknown as CacheUpdaterClient;

const configClient = new grpcObj.cache.ConfiUpdator(
  target,
  grpc.credentials.createInsecure(),
) as unknown as ConfiUpdatorClient;

const apiKeyClient = new grpcObj.cache.ApiKeyUpdator(
  target,
  grpc.credentials.createInsecure(),
) as unknown as ApiKeyUpdatorClient;

export function UpdateFlagCache(flagId: string, rules: string) {
  return new Promise((resolve, reject) => {
    flagClient.UpdateFlagRules(
      { envId: '', flagId, rules, userId: '', version: 1 },
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      },
    );
  });
}

export function UpdateConfig(envId: string, envName: string, config: string) {
  return new Promise((resolve, reject) => {
    configClient.UpdateEnvConfig({ config, envId, envName }, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

export function UpdateApiKey(apiKey: string, userId: string) {
  return new Promise((resolve, reject) => {
    apiKeyClient.UpdateApiKey({ apiKey, userId }, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}
