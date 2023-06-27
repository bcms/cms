import type { BCMSTag } from '@becomes/cms-sdk/types';
import type { ActionTree, GetterTree, MutationTree } from 'vuex';
import type {
  BCMSStoreTagActions,
  BCMSStoreTagGetters,
  BCMSStoreTagMutations,
  BCMSStoreState,
} from '../types';
import {
  BCMSStoreMutationTypes,
  BCMSStoreGetterTypes,
  BCMSStoreActionTypes,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSTag>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSTag>();

export const mutations: MutationTree<BCMSStoreState> & BCMSStoreTagMutations = {
  [BCMSStoreMutationTypes.tag_set](state, payload) {
    defaultMutations.set(state.color, payload);
  },
  [BCMSStoreMutationTypes.tag_remove](state, payload) {
    defaultMutations.remove(state.color, payload);
  },
};
export const getters: GetterTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreTagGetters = {
  [BCMSStoreGetterTypes.tag_items](state) {
    return state.color;
  },
  [BCMSStoreGetterTypes.tag_find](state) {
    return (query) => {
      return defaultGetters.find(state.color, query);
    };
  },
  [BCMSStoreGetterTypes.tag_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.color, query);
    };
  },
};
export const actions: ActionTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreTagActions = {
  [BCMSStoreActionTypes.tag_set]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.tag_set, payload);
  },
  [BCMSStoreActionTypes.tag_remove]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.tag_remove, payload);
  },
};
