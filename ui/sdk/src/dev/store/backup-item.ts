import type { BCMSBackupListItem } from '../../types';
import {
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
} from '../types';
import type { BCMSStoreBackupItemGetters, BCMSStoreBackupItemMutations } from '../types/backup-item';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSBackupListItem>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSBackupListItem>();

export const mutations: BCMSStoreBackupItemMutations = {
  [BCMSStoreMutationTypes.backupItem_set](state, payload) {
    defaultMutations.set(state.backupItem, payload);
  },
  [BCMSStoreMutationTypes.backupItem_remove](state, payload) {
    defaultMutations.remove(state.backupItem, payload);
  },
};
export const getters: BCMSStoreBackupItemGetters = {
  [BCMSStoreGetterTypes.backupItem_items](state) {
    return state.backupItem;
  },
  [BCMSStoreGetterTypes.backupItem_find](state) {
    return (query) => {
      return defaultGetters.find(state.backupItem, query);
    };
  },
  [BCMSStoreGetterTypes.backupItem_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.backupItem, query);
    };
  },
};
