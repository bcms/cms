import type {
  BCMSStoreGetterQuery,
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreState,
} from '.';
import type { BCMSTag } from '../../types';

type EntityItem = BCMSTag;

export interface BCMSStoreTagMutations {
  [BCMSStoreMutationTypes.tag_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
  [BCMSStoreMutationTypes.tag_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
}

export interface BCMSStoreTagGetters {
  [BCMSStoreGetterTypes.tag_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.tag_find](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.tag_findOne](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
