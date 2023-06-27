import type { BCMSApiKey } from '@becomes/cms-sdk/types';
import type {
  BCMSStoreActionTypes,
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
} from './enums';
import type {
  BCMSStoreActionAugments,
  BCMSStoreGetterQuery,
  BCMSStoreState,
} from './main';

type EntityItem = BCMSApiKey;

export interface BCMSStoreApiKeyMutations {
  [BCMSStoreMutationTypes.apiKey_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[]
  ): void;
  [BCMSStoreMutationTypes.apiKey_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[]
  ): void;
}
export interface BCMSStoreApiKeyGetters {
  [BCMSStoreGetterTypes.apiKey_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.apiKey_find](
    state: BCMSStoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.apiKey_findOne](
    state: BCMSStoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
export interface BCMSStoreApiKeyActions {
  [BCMSStoreActionTypes.apiKey_set](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem[]
  ): void;
  [BCMSStoreActionTypes.apiKey_remove](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem | EntityItem[]
  ): void;
}
