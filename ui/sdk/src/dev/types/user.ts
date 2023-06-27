import type { BCMSUser } from '../../types';
import type { BCMSStoreGetterTypes, BCMSStoreMutationTypes } from './enums';
import type { BCMSStoreGetterQuery, BCMSStoreState } from './main';

type EntityItem = BCMSUser;

export interface BCMSStoreUserMutations {
  [BCMSStoreMutationTypes.user_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
  [BCMSStoreMutationTypes.user_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
}
export interface BCMSStoreUserGetters {
  [BCMSStoreGetterTypes.user_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.user_me](state: BCMSStoreState): EntityItem | undefined;
  [BCMSStoreGetterTypes.user_find](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.user_findOne](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
