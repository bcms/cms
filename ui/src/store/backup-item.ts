import type { BCMSBackupListItem } from '@becomes/cms-sdk/types';
import type { ActionTree, GetterTree, MutationTree } from 'vuex';
import type {
  BCMSStoreBackupItemActions,
  BCMSStoreBackupItemGetters,
  BCMSStoreBackupItemMutations,
  BCMSStoreState,
} from '../types';
import {
  BCMSStoreActionTypes,
  BCMSStoreMutationTypes,
  BCMSStoreGetterTypes,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSBackupListItem>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSBackupListItem>();

export const mutations: MutationTree<BCMSStoreState> &
  BCMSStoreBackupItemMutations = {
  [BCMSStoreMutationTypes.backupItem_set](state, payload) {
    defaultMutations.set(state.backupItem, payload);
  },
  [BCMSStoreMutationTypes.backupItem_remove](state, payload) {
    defaultMutations.remove(state.backupItem, payload);
  },
};
export const getters: GetterTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreBackupItemGetters = {
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
export const actions: ActionTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreBackupItemActions = {
  [BCMSStoreActionTypes.backupItem_set]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.backupItem_set, payload);
  },
  [BCMSStoreActionTypes.backupItem_remove]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.backupItem_remove, payload);
  },
};
