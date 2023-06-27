import type { BCMSMedia } from '@becomes/cms-sdk/types';
import type { MutationTree, GetterTree, ActionTree } from 'vuex';
import type {
  BCMSStoreState,
  BCMSStoreMediaActions,
  BCMSStoreMediaGetters,
  BCMSStoreMediaMutations,
} from '../types';
import {
  BCMSStoreMutationTypes,
  BCMSStoreGetterTypes,
  BCMSStoreActionTypes,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSMedia>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSMedia>();

export const mutations: MutationTree<BCMSStoreState> & BCMSStoreMediaMutations =
  {
    [BCMSStoreMutationTypes.media_set](state, payload) {
      defaultMutations.set(state.media, payload);
    },
    [BCMSStoreMutationTypes.media_remove](state, payload) {
      defaultMutations.remove(state.media, payload);
    },
  };

export const getters: GetterTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreMediaGetters = {
  [BCMSStoreGetterTypes.media_items](state) {
    return state.media;
  },
  [BCMSStoreGetterTypes.media_find](state) {
    return (query) => {
      return defaultGetters.find(state.media, query);
    };
  },
  [BCMSStoreGetterTypes.media_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.media, query);
    };
  },
};

export const actions: ActionTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreMediaActions = {
  [BCMSStoreActionTypes.media_set]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.media_set, payload);
  },
  [BCMSStoreActionTypes.media_remove]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.media_remove, payload);
  },
};
