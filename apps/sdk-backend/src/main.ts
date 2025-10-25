import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./server/proto/generated/cache";
import { configHandler, ruleshandler as handler } from "./server/grpcServer";
import express from "express";
import { getCOnfigForEnv, handleEvaluator } from "./server/restServer";
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, "./protos/cache.proto")
);

const personProto = grpc.loadPackageDefinition(
  packageDefinition
) as unknown as ProtoGrpcType;

const server = new grpc.Server();

server.addService(personProto.cache.CacheUpdater.service, handler);
server.addService(personProto.cache.ConfiUpdator.service, configHandler);

server.bindAsync(
  "localhost:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start();
  }
);

const app = express();

app.post("/v1/evaluate", handleEvaluator);
app.post("/v1/config", getCOnfigForEnv);

app.listen(8080, () => console.log(":server running"));
