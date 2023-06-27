import type { BCMSEntryLite } from '@becomes/cms-sdk/types';
import type { MutationTree, GetterTree, ActionTree } from 'vuex';
import type {
  BCMSStoreState,
  BCMSStoreEntryLiteActions,
  BCMSStoreEntryLiteGetters,
  BCMSStoreEntryLiteMutations,
} from '../types';
import {
  BCMSStoreMutationTypes,
  BCMSStoreGetterTypes,
  BCMSStoreActionTypes,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSEntryLite>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSEntryLite>();

export const mutations: MutationTree<BCMSStoreState> &
  BCMSStoreEntryLiteMutations = {
  [BCMSStoreMutationTypes.entryLite_set](state, payload) {
    defaultMutations.set(state.entryLite, payload);
  },
  [BCMSStoreMutationTypes.entryLite_remove](state, payload) {
    defaultMutations.remove(state.entryLite, payload);
  },
};

export const getters: GetterTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreEntryLiteGetters = {
  [BCMSStoreGetterTypes.entryLite_items](state) {
    return state.entryLite;
  },
  [BCMSStoreGetterTypes.entryLite_find](state) {
    return (query) => {
      return defaultGetters.find(state.entryLite, query);
    };
  },
  [BCMSStoreGetterTypes.entryLite_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.entryLite, query);
    };
  },
};

export const actions: ActionTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreEntryLiteActions = {
  [BCMSStoreActionTypes.entryLite_set]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.entryLite_set, payload);
  },
  [BCMSStoreActionTypes.entryLite_remove]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.entryLite_remove, payload);
  },
};
