import type { MutationTree, GetterTree, ActionTree } from 'vuex';
import {
  BCMSStatus,
  BCMSStoreActionTypes,
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreState,
  BCMSStoreStatusActions,
  BCMSStoreStatusGetters,
  BCMSStoreStatusMutations,
} from '../src/types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSStatus>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSStatus>();

export const mutations: MutationTree<BCMSStoreState> &
  BCMSStoreStatusMutations = {
  [BCMSStoreMutationTypes.status_set](state, payload) {
    defaultMutations.set(state.status, payload);
  },
  [BCMSStoreMutationTypes.status_remove](state, payload) {
    defaultMutations.remove(state.status, payload);
  },
};

export const getters: GetterTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreStatusGetters = {
  [BCMSStoreGetterTypes.status_items](state) {
    return state.status;
  },
  [BCMSStoreGetterTypes.status_find](state) {
    return (query) => {
      return defaultGetters.find(state.status, query);
    };
  },
  [BCMSStoreGetterTypes.status_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.status, query);
    };
  },
};

export const actions: ActionTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreStatusActions = {
  [BCMSStoreActionTypes.status_set]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.status_set, payload);
  },
  [BCMSStoreActionTypes.status_remove]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.status_remove, payload);
  },
};
