// Original file: src/protos/cache.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { ApiKeyRequest as _cache_ApiKeyRequest, ApiKeyRequest__Output as _cache_ApiKeyRequest__Output } from '../cache/ApiKeyRequest';
import type { ApiKeyResponse as _cache_ApiKeyResponse, ApiKeyResponse__Output as _cache_ApiKeyResponse__Output } from '../cache/ApiKeyResponse';

export interface ApiKeyUpdatorClient extends grpc.Client {
  UpdateApiKey(argument: _cache_ApiKeyRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_cache_ApiKeyResponse__Output>): grpc.ClientUnaryCall;
  UpdateApiKey(argument: _cache_ApiKeyRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_cache_ApiKeyResponse__Output>): grpc.ClientUnaryCall;
  UpdateApiKey(argument: _cache_ApiKeyRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_cache_ApiKeyResponse__Output>): grpc.ClientUnaryCall;
  UpdateApiKey(argument: _cache_ApiKeyRequest, callback: grpc.requestCallback<_cache_ApiKeyResponse__Output>): grpc.ClientUnaryCall;
  updateApiKey(argument: _cache_ApiKeyRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_cache_ApiKeyResponse__Output>): grpc.ClientUnaryCall;
  updateApiKey(argument: _cache_ApiKeyRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_cache_ApiKeyResponse__Output>): grpc.ClientUnaryCall;
  updateApiKey(argument: _cache_ApiKeyRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_cache_ApiKeyResponse__Output>): grpc.ClientUnaryCall;
  updateApiKey(argument: _cache_ApiKeyRequest, callback: grpc.requestCallback<_cache_ApiKeyResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface ApiKeyUpdatorHandlers extends grpc.UntypedServiceImplementation {
  UpdateApiKey: grpc.handleUnaryCall<_cache_ApiKeyRequest__Output, _cache_ApiKeyResponse>;
  
}

export interface ApiKeyUpdatorDefinition extends grpc.ServiceDefinition {
  UpdateApiKey: MethodDefinition<_cache_ApiKeyRequest, _cache_ApiKeyResponse, _cache_ApiKeyRequest__Output, _cache_ApiKeyResponse__Output>
}
