import type { BCMSGroupLite } from '../../types';
import type { BCMSStoreGetterTypes, BCMSStoreMutationTypes } from './enums';
import type { BCMSStoreGetterQuery, BCMSStoreState } from './main';

type EntityItem = BCMSGroupLite;

export interface BCMSStoreGroupLiteMutations {
  [BCMSStoreMutationTypes.groupLite_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
  [BCMSStoreMutationTypes.groupLite_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
}
export interface BCMSStoreGroupLiteGetters {
  [BCMSStoreGetterTypes.groupLite_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.groupLite_find](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.groupLite_findOne](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
