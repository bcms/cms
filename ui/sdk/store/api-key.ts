import type { MutationTree, GetterTree, ActionTree } from 'vuex';
import {
  BCMSApiKey,
  BCMSStoreActionTypes,
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreState,
  BCMSStoreApiKeyActions,
  BCMSStoreApiKeyGetters,
  BCMSStoreApiKeyMutations,
} from '../src/types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSApiKey>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSApiKey>();

export const mutations: MutationTree<BCMSStoreState> &
  BCMSStoreApiKeyMutations = {
  [BCMSStoreMutationTypes.apiKey_set](state, payload) {
    defaultMutations.set(state.apiKey, payload);
  },
  [BCMSStoreMutationTypes.apiKey_remove](state, payload) {
    defaultMutations.remove(state.apiKey, payload);
  },
};

export const getters: GetterTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreApiKeyGetters = {
  [BCMSStoreGetterTypes.apiKey_items](state) {
    return state.apiKey;
  },
  [BCMSStoreGetterTypes.apiKey_find](state) {
    return (query) => {
      return defaultGetters.find(state.apiKey, query);
    };
  },
  [BCMSStoreGetterTypes.apiKey_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.apiKey, query);
    };
  },
};

export const actions: ActionTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreApiKeyActions = {
  [BCMSStoreActionTypes.apiKey_set]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.apiKey_set, payload);
  },
  [BCMSStoreActionTypes.apiKey_remove]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.apiKey_remove, payload);
  },
};
