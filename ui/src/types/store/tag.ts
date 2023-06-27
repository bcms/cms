import type { BCMSTag } from '@becomes/cms-sdk/types';
import {
  BCMSStoreMutationTypes,
  BCMSStoreGetterTypes,
  BCMSStoreActionTypes,
} from './enums';
import type {
  BCMSStoreActionAugments,
  BCMSStoreGetterQuery,
  BCMSStoreState,
} from './main';

type EntityItem = BCMSTag;

export interface BCMSStoreTagMutations {
  [BCMSStoreMutationTypes.tag_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[]
  ): void;
  [BCMSStoreMutationTypes.tag_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[]
  ): void;
}

export interface BCMSStoreTagGetters {
  [BCMSStoreGetterTypes.tag_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.tag_find](
    state: BCMSStoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.tag_findOne](
    state: BCMSStoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
export interface BCMSStoreTagActions {
  [BCMSStoreActionTypes.tag_set](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem[]
  ): void;
  [BCMSStoreActionTypes.tag_remove](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem | EntityItem[]
  ): void;
}
