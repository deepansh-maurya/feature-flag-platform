// Original file: proto/cache.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { ConfigRequest as _cache_ConfigRequest, ConfigRequest__Output as _cache_ConfigRequest__Output } from '../cache/ConfigRequest';
import type { ConfigResponse as _cache_ConfigResponse, ConfigResponse__Output as _cache_ConfigResponse__Output } from '../cache/ConfigResponse';

export interface ConfiUpdatorClient extends grpc.Client {
  UpdateEnvConfig(argument: _cache_ConfigRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_cache_ConfigResponse__Output>): grpc.ClientUnaryCall;
  UpdateEnvConfig(argument: _cache_ConfigRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_cache_ConfigResponse__Output>): grpc.ClientUnaryCall;
  UpdateEnvConfig(argument: _cache_ConfigRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_cache_ConfigResponse__Output>): grpc.ClientUnaryCall;
  UpdateEnvConfig(argument: _cache_ConfigRequest, callback: grpc.requestCallback<_cache_ConfigResponse__Output>): grpc.ClientUnaryCall;
  updateEnvConfig(argument: _cache_ConfigRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_cache_ConfigResponse__Output>): grpc.ClientUnaryCall;
  updateEnvConfig(argument: _cache_ConfigRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_cache_ConfigResponse__Output>): grpc.ClientUnaryCall;
  updateEnvConfig(argument: _cache_ConfigRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_cache_ConfigResponse__Output>): grpc.ClientUnaryCall;
  updateEnvConfig(argument: _cache_ConfigRequest, callback: grpc.requestCallback<_cache_ConfigResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface ConfiUpdatorHandlers extends grpc.UntypedServiceImplementation {
  UpdateEnvConfig: grpc.handleUnaryCall<_cache_ConfigRequest__Output, _cache_ConfigResponse>;
  
}

export interface ConfiUpdatorDefinition extends grpc.ServiceDefinition {
  UpdateEnvConfig: MethodDefinition<_cache_ConfigRequest, _cache_ConfigResponse, _cache_ConfigRequest__Output, _cache_ConfigResponse__Output>
}
