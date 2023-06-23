import type { MutationTree, GetterTree, ActionTree } from 'vuex';
import {
  BCMSGroupLite,
  BCMSStoreActionTypes,
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreState,
  BCMSStoreGroupLiteActions,
  BCMSStoreGroupLiteGetters,
  BCMSStoreGroupLiteMutations,
} from '../src/types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSGroupLite>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSGroupLite>();

export const mutations: MutationTree<BCMSStoreState> &
  BCMSStoreGroupLiteMutations = {
  [BCMSStoreMutationTypes.groupLite_set](state, payload) {
    defaultMutations.set(state.groupLite, payload);
  },
  [BCMSStoreMutationTypes.groupLite_remove](state, payload) {
    defaultMutations.remove(state.groupLite, payload);
  },
};

export const getters: GetterTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreGroupLiteGetters = {
  [BCMSStoreGetterTypes.groupLite_items](state) {
    return state.groupLite;
  },
  [BCMSStoreGetterTypes.groupLite_find](state) {
    return (query) => {
      return defaultGetters.find(state.groupLite, query);
    };
  },
  [BCMSStoreGetterTypes.groupLite_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.groupLite, query);
    };
  },
};

export const actions: ActionTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreGroupLiteActions = {
  [BCMSStoreActionTypes.groupLite_set]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.groupLite_set, payload);
  },
  [BCMSStoreActionTypes.groupLite_remove]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.groupLite_remove, payload);
  },
};
