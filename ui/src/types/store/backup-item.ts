import type { BCMSBackupListItem } from '@becomes/cms-sdk/types';
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

type EntityItem = BCMSBackupListItem;

export interface BCMSStoreBackupItemMutations {
  [BCMSStoreMutationTypes.backupItem_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[]
  ): void;
  [BCMSStoreMutationTypes.backupItem_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[]
  ): void;
}

export interface BCMSStoreBackupItemGetters {
  [BCMSStoreGetterTypes.backupItem_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.backupItem_find](
    state: BCMSStoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.backupItem_findOne](
    state: BCMSStoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
export interface BCMSStoreBackupItemActions {
  [BCMSStoreActionTypes.backupItem_set](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem[]
  ): void;
  [BCMSStoreActionTypes.backupItem_remove](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem | EntityItem[]
  ): void;
}
