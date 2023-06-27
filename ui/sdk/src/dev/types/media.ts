import type { BCMSMedia } from '../../types';
import type {
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
} from './enums';
import type { BCMSStoreGetterQuery, BCMSStoreState } from './main';

type EntityItem = BCMSMedia;

export interface BCMSStoreMediaMutations {
  [BCMSStoreMutationTypes.media_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
  [BCMSStoreMutationTypes.media_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
}
export interface BCMSStoreMediaGetters {
  [BCMSStoreGetterTypes.media_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.media_find](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.media_findOne](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
