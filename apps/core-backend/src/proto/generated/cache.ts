import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type {
  ApiKeyRequest as _cache_ApiKeyRequest,
  ApiKeyRequest__Output as _cache_ApiKeyRequest__Output,
} from './cache/ApiKeyRequest';
import type {
  ApiKeyResponse as _cache_ApiKeyResponse,
  ApiKeyResponse__Output as _cache_ApiKeyResponse__Output,
} from './cache/ApiKeyResponse';
import type {
  ApiKeyUpdatorClient as _cache_ApiKeyUpdatorClient,
  ApiKeyUpdatorDefinition as _cache_ApiKeyUpdatorDefinition,
} from './cache/ApiKeyUpdator';
import type {
  CacheUpdaterClient as _cache_CacheUpdaterClient,
  CacheUpdaterDefinition as _cache_CacheUpdaterDefinition,
} from './cache/CacheUpdater';
import type {
  ConfiUpdatorClient as _cache_ConfiUpdatorClient,
  ConfiUpdatorDefinition as _cache_ConfiUpdatorDefinition,
} from './cache/ConfiUpdator';
import type {
  ConfigRequest as _cache_ConfigRequest,
  ConfigRequest__Output as _cache_ConfigRequest__Output,
} from './cache/ConfigRequest';
import type {
  ConfigResponse as _cache_ConfigResponse,
  ConfigResponse__Output as _cache_ConfigResponse__Output,
} from './cache/ConfigResponse';
import type {
  UpdateFlagRequest as _cache_UpdateFlagRequest,
  UpdateFlagRequest__Output as _cache_UpdateFlagRequest__Output,
} from './cache/UpdateFlagRequest';
import type {
  UpdateFlagResponse as _cache_UpdateFlagResponse,
  UpdateFlagResponse__Output as _cache_UpdateFlagResponse__Output,
} from './cache/UpdateFlagResponse';

type SubtypeConstructor<
  Constructor extends new (...args: any) => any,
  Subtype,
> = {
  new (...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  cache: {
    ApiKeyRequest: MessageTypeDefinition<
      _cache_ApiKeyRequest,
      _cache_ApiKeyRequest__Output
    >;
    ApiKeyResponse: MessageTypeDefinition<
      _cache_ApiKeyResponse,
      _cache_ApiKeyResponse__Output
    >;
    ApiKeyUpdator: SubtypeConstructor<
      typeof grpc.Client,
      _cache_ApiKeyUpdatorClient
    > & { service: _cache_ApiKeyUpdatorDefinition };
    CacheUpdater: SubtypeConstructor<
      typeof grpc.Client,
      _cache_CacheUpdaterClient
    > & { service: _cache_CacheUpdaterDefinition };
    ConfiUpdator: SubtypeConstructor<
      typeof grpc.Client,
      _cache_ConfiUpdatorClient
    > & { service: _cache_ConfiUpdatorDefinition };
    ConfigRequest: MessageTypeDefinition<
      _cache_ConfigRequest,
      _cache_ConfigRequest__Output
    >;
    ConfigResponse: MessageTypeDefinition<
      _cache_ConfigResponse,
      _cache_ConfigResponse__Output
    >;
    UpdateFlagRequest: MessageTypeDefinition<
      _cache_UpdateFlagRequest,
      _cache_UpdateFlagRequest__Output
    >;
    UpdateFlagResponse: MessageTypeDefinition<
      _cache_UpdateFlagResponse,
      _cache_UpdateFlagResponse__Output
    >;
  };
}
