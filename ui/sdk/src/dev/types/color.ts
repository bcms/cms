import type {
  BCMSStoreGetterQuery,
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreState,
} from '.';
import type { BCMSColor } from '../../types';

type EntityItem = BCMSColor;

export interface BCMSStoreColorMutations {
  [BCMSStoreMutationTypes.color_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
  [BCMSStoreMutationTypes.color_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
}

export interface BCMSStoreColorGetters {
  [BCMSStoreGetterTypes.color_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.color_find](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.color_findOne](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
