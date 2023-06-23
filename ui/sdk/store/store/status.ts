import type { BCMSStatus } from '../models';
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

type EntityItem = BCMSStatus;

export interface BCMSStoreStatusMutations {
  [BCMSStoreMutationTypes.status_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
  [BCMSStoreMutationTypes.status_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
}
export interface BCMSStoreStatusGetters {
  [BCMSStoreGetterTypes.status_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.status_find](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.status_findOne](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
export interface BCMSStoreStatusActions {
  [BCMSStoreActionTypes.status_set](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem[],
  ): void;
  [BCMSStoreActionTypes.status_remove](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem | EntityItem[],
  ): void;
}
