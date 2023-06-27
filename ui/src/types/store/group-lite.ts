import type { BCMSGroupLite } from '@becomes/cms-sdk/types';
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

type EntityItem = BCMSGroupLite;

export interface BCMSStoreGroupLiteMutations {
  [BCMSStoreMutationTypes.groupLite_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[]
  ): void;
  [BCMSStoreMutationTypes.groupLite_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[]
  ): void;
}
export interface BCMSStoreGroupLiteGetters {
  [BCMSStoreGetterTypes.groupLite_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.groupLite_find](
    state: BCMSStoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.groupLite_findOne](
    state: BCMSStoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
export interface BCMSStoreGroupLiteActions {
  [BCMSStoreActionTypes.groupLite_set](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem[]
  ): void;
  [BCMSStoreActionTypes.groupLite_remove](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem | EntityItem[]
  ): void;
}
