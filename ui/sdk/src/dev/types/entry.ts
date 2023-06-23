import type { BCMSEntry } from '../../types';
import type {
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
} from './enums';
import type { BCMSStoreGetterQuery, BCMSStoreState } from './main';

type EntityItem = BCMSEntry;

export interface BCMSStoreEntryMutations {
  [BCMSStoreMutationTypes.entry_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
  [BCMSStoreMutationTypes.entry_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
}
export interface BCMSStoreEntryGetters {
  [BCMSStoreGetterTypes.entry_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.entry_find](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.entry_findOne](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
