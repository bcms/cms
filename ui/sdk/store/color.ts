import type { ActionTree, GetterTree, MutationTree } from 'vuex';
import {
  BCMSColor,
  BCMSStoreActionTypes,
  BCMSStoreColorActions,
  BCMSStoreColorGetters,
  BCMSStoreColorMutations,
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreState,
} from '../src/types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSColor>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSColor>();

export const mutations: MutationTree<BCMSStoreState> & BCMSStoreColorMutations =
  {
    [BCMSStoreMutationTypes.color_set](state, payload) {
      defaultMutations.set(state.color, payload);
    },
    [BCMSStoreMutationTypes.color_remove](state, payload) {
      defaultMutations.remove(state.color, payload);
    },
  };
export const getters: GetterTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreColorGetters = {
  [BCMSStoreGetterTypes.color_items](state) {
    return state.color;
  },
  [BCMSStoreGetterTypes.color_find](state) {
    return (query) => {
      return defaultGetters.find(state.color, query);
    };
  },
  [BCMSStoreGetterTypes.color_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.color, query);
    };
  },
};
export const actions: ActionTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreColorActions = {
  [BCMSStoreActionTypes.color_set]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.color_set, payload);
  },
  [BCMSStoreActionTypes.color_remove]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.color_remove, payload);
  },
};
