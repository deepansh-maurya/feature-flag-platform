import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./server/proto/generated/cache";
import {
  apiKeyHandler,
  configHandler,
  ruleshandler as handler
} from "./server/grpcServer";
import express from "express";
import {
  getCOnfigForEnv,
  handleEvaluator,
  verifyApiKey
} from "./server/restServer";
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, "./protos/cache.proto")
);

const personProto = grpc.loadPackageDefinition(
  packageDefinition
) as unknown as ProtoGrpcType;

const server = new grpc.Server();

server.addService(personProto.cache.CacheUpdater.service, handler);
server.addService(personProto.cache.ConfiUpdator.service, configHandler);
server.addService(personProto.cache.ApiKeyUpdator.service, apiKeyHandler);

server.bindAsync(
  "localhost:0",
  grpc.ServerCredentials.createInsecure(),
  (err: Error | null, port: number) => {
     if (err) {
      console.error("gRPC bind failed:", err);
      process.exitCode = 1;
      return;
    }

    console.log(`gRPC server bound on port: ${port}`);
    server.start();
  }
);

const app = express();

app.post("/v1/evaluate", verifyApiKey, handleEvaluator);
app.post("/v1/config", verifyApiKey, getCOnfigForEnv);

app.listen(8080, () => console.log(":server running"));
