import type { BCMSGroup } from '../../types';
import type {
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
} from './enums';
import type { BCMSStoreGetterQuery, BCMSStoreState } from './main';

type EntityItem = BCMSGroup;

export interface BCMSStoreGroupMutations {
  [BCMSStoreMutationTypes.group_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
  [BCMSStoreMutationTypes.group_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
}
export interface BCMSStoreGroupGetters {
  [BCMSStoreGetterTypes.group_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.group_find](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.group_findOne](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
