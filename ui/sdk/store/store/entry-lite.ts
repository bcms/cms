import type { BCMSEntryLite } from '../models';
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

type EntityItem = BCMSEntryLite;

export interface BCMSStoreEntryLiteMutations {
  [BCMSStoreMutationTypes.entryLite_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
  [BCMSStoreMutationTypes.entryLite_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
}
export interface BCMSStoreEntryLiteGetters {
  [BCMSStoreGetterTypes.entryLite_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.entryLite_find](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.entryLite_findOne](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
export interface BCMSStoreEntryLiteActions {
  [BCMSStoreActionTypes.entryLite_set](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem[],
  ): void;
  [BCMSStoreActionTypes.entryLite_remove](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem | EntityItem[],
  ): void;
}
