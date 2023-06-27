import type {
  BCMSStoreGetterQuery,
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreState,
} from '.';
import type { BCMSBackupListItem } from '../../types';

type EntityItem = BCMSBackupListItem;

export interface BCMSStoreBackupItemMutations {
  [BCMSStoreMutationTypes.backupItem_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
  [BCMSStoreMutationTypes.backupItem_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
}

export interface BCMSStoreBackupItemGetters {
  [BCMSStoreGetterTypes.backupItem_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.backupItem_find](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.backupItem_findOne](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
