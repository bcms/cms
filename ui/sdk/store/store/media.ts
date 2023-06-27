import type { BCMSMedia } from '../models';
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
export interface BCMSStoreMediaActions {
  [BCMSStoreActionTypes.media_set](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem[],
  ): void;
  [BCMSStoreActionTypes.media_remove](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem | EntityItem[],
  ): void;
}
