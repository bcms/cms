import type { MutationTree, GetterTree, ActionTree } from 'vuex';
import {
  BCMSEntry,
  BCMSStoreActionTypes,
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreState,
  BCMSStoreEntryActions,
  BCMSStoreEntryGetters,
  BCMSStoreEntryMutations,
} from '../src/types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSEntry>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSEntry>();

export const mutations: MutationTree<BCMSStoreState> &
  BCMSStoreEntryMutations = {
  [BCMSStoreMutationTypes.entry_set](state, payload) {
    defaultMutations.set(state.entry, payload);
  },
  [BCMSStoreMutationTypes.entry_remove](state, payload) {
    defaultMutations.remove(state.entry, payload);
  },
};

export const getters: GetterTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreEntryGetters = {
  [BCMSStoreGetterTypes.entry_items](state) {
    return state.entry;
  },
  [BCMSStoreGetterTypes.entry_find](state) {
    return (query) => {
      return defaultGetters.find(state.entry, query);
    };
  },
  [BCMSStoreGetterTypes.entry_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.entry, query);
    };
  },
};

export const actions: ActionTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreEntryActions = {
  [BCMSStoreActionTypes.entry_set]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.entry_set, payload);
  },
  [BCMSStoreActionTypes.entry_remove]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.entry_remove, payload);
  },
};
