import type { BCMSApiKey } from '../../types';
import type {
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
} from './enums';
import type {
  BCMSStoreGetterQuery,
  BCMSStoreState,
} from './main';

type EntityItem = BCMSApiKey;

export interface BCMSStoreApiKeyMutations {
  [BCMSStoreMutationTypes.apiKey_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
  [BCMSStoreMutationTypes.apiKey_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
}
export interface BCMSStoreApiKeyGetters {
  [BCMSStoreGetterTypes.apiKey_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.apiKey_find](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.apiKey_findOne](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
