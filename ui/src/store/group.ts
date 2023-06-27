import type { BCMSGroup } from '@becomes/cms-sdk/types';
import type { MutationTree, GetterTree, ActionTree } from 'vuex';
import type {
  BCMSStoreState,
  BCMSStoreGroupActions,
  BCMSStoreGroupGetters,
  BCMSStoreGroupMutations,
} from '../types';
import {
  BCMSStoreMutationTypes,
  BCMSStoreGetterTypes,
  BCMSStoreActionTypes,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSGroup>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSGroup>();

export const mutations: MutationTree<BCMSStoreState> & BCMSStoreGroupMutations =
  {
    [BCMSStoreMutationTypes.group_set](state, payload) {
      defaultMutations.set(state.group, payload);
    },
    [BCMSStoreMutationTypes.group_remove](state, payload) {
      defaultMutations.remove(state.group, payload);
    },
  };

export const getters: GetterTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreGroupGetters = {
  [BCMSStoreGetterTypes.group_items](state) {
    return state.group;
  },
  [BCMSStoreGetterTypes.group_find](state) {
    return (query) => {
      return defaultGetters.find(state.group, query);
    };
  },
  [BCMSStoreGetterTypes.group_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.group, query);
    };
  },
};

export const actions: ActionTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreGroupActions = {
  [BCMSStoreActionTypes.group_set]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.group_set, payload);
  },
  [BCMSStoreActionTypes.group_remove]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.group_remove, payload);
  },
};
