import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { CacheUpdaterClient as _cache_CacheUpdaterClient, CacheUpdaterDefinition as _cache_CacheUpdaterDefinition } from './cache/CacheUpdater';
import type { UpdateFlagRequest as _cache_UpdateFlagRequest, UpdateFlagRequest__Output as _cache_UpdateFlagRequest__Output } from './cache/UpdateFlagRequest';
import type { UpdateFlagResponse as _cache_UpdateFlagResponse, UpdateFlagResponse__Output as _cache_UpdateFlagResponse__Output } from './cache/UpdateFlagResponse';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  cache: {
    CacheUpdater: SubtypeConstructor<typeof grpc.Client, _cache_CacheUpdaterClient> & { service: _cache_CacheUpdaterDefinition }
    UpdateFlagRequest: MessageTypeDefinition<_cache_UpdateFlagRequest, _cache_UpdateFlagRequest__Output>
    UpdateFlagResponse: MessageTypeDefinition<_cache_UpdateFlagResponse, _cache_UpdateFlagResponse__Output>
  }
}

