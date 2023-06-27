import type { BCMSEntry } from '@becomes/cms-sdk/types';
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

type EntityItem = BCMSEntry;

export interface BCMSStoreEntryMutations {
  [BCMSStoreMutationTypes.entry_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[]
  ): void;
  [BCMSStoreMutationTypes.entry_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[]
  ): void;
}
export interface BCMSStoreEntryGetters {
  [BCMSStoreGetterTypes.entry_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.entry_find](
    state: BCMSStoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.entry_findOne](
    state: BCMSStoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
export interface BCMSStoreEntryActions {
  [BCMSStoreActionTypes.entry_set](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem[]
  ): void;
  [BCMSStoreActionTypes.entry_remove](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem | EntityItem[]
  ): void;
}
