import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./server/proto/generated/cache";
import { handler } from "./server/grpcServer";

const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, "./proto/cache.proto")
);

const personProto = grpc.loadPackageDefinition(
  packageDefinition
) as unknown as ProtoGrpcType;




const server = new grpc.Server();

server.addService(personProto.cache.CacheUpdater.service, handler);
server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start();
  }
);
