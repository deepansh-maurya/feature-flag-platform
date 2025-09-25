// Original file: src/protos/cache.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { UpdateFlagRequest as _cache_UpdateFlagRequest, UpdateFlagRequest__Output as _cache_UpdateFlagRequest__Output } from '../cache/UpdateFlagRequest';
import type { UpdateFlagResponse as _cache_UpdateFlagResponse, UpdateFlagResponse__Output as _cache_UpdateFlagResponse__Output } from '../cache/UpdateFlagResponse';

export interface CacheUpdaterClient extends grpc.Client {
  UpdateFlagRules(argument: _cache_UpdateFlagRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_cache_UpdateFlagResponse__Output>): grpc.ClientUnaryCall;
  UpdateFlagRules(argument: _cache_UpdateFlagRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_cache_UpdateFlagResponse__Output>): grpc.ClientUnaryCall;
  UpdateFlagRules(argument: _cache_UpdateFlagRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_cache_UpdateFlagResponse__Output>): grpc.ClientUnaryCall;
  UpdateFlagRules(argument: _cache_UpdateFlagRequest, callback: grpc.requestCallback<_cache_UpdateFlagResponse__Output>): grpc.ClientUnaryCall;
  updateFlagRules(argument: _cache_UpdateFlagRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_cache_UpdateFlagResponse__Output>): grpc.ClientUnaryCall;
  updateFlagRules(argument: _cache_UpdateFlagRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_cache_UpdateFlagResponse__Output>): grpc.ClientUnaryCall;
  updateFlagRules(argument: _cache_UpdateFlagRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_cache_UpdateFlagResponse__Output>): grpc.ClientUnaryCall;
  updateFlagRules(argument: _cache_UpdateFlagRequest, callback: grpc.requestCallback<_cache_UpdateFlagResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface CacheUpdaterHandlers extends grpc.UntypedServiceImplementation {
  UpdateFlagRules: grpc.handleUnaryCall<_cache_UpdateFlagRequest__Output, _cache_UpdateFlagResponse>;
  
}

export interface CacheUpdaterDefinition extends grpc.ServiceDefinition {
  UpdateFlagRules: MethodDefinition<_cache_UpdateFlagRequest, _cache_UpdateFlagResponse, _cache_UpdateFlagRequest__Output, _cache_UpdateFlagResponse__Output>
}
