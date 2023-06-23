import type { BCMSLanguage } from '@becomes/cms-sdk/types';
import type { MutationTree, GetterTree, ActionTree } from 'vuex';
import type {
  BCMSStoreState,
  BCMSStoreLanguageActions,
  BCMSStoreLanguageGetters,
  BCMSStoreLanguageMutations,
} from '../types';
import {
  BCMSStoreMutationTypes,
  BCMSStoreGetterTypes,
  BCMSStoreActionTypes,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSLanguage>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSLanguage>();

export const mutations: MutationTree<BCMSStoreState> &
  BCMSStoreLanguageMutations = {
  [BCMSStoreMutationTypes.language_set](state, payload) {
    defaultMutations.set(state.language, payload);
  },
  [BCMSStoreMutationTypes.language_remove](state, payload) {
    defaultMutations.remove(state.language, payload);
  },
};

export const getters: GetterTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreLanguageGetters = {
  [BCMSStoreGetterTypes.language_items](state) {
    return state.language;
  },
  [BCMSStoreGetterTypes.language_find](state) {
    return (query) => {
      return defaultGetters.find(state.language, query);
    };
  },
  [BCMSStoreGetterTypes.language_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.language, query);
    };
  },
};

export const actions: ActionTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreLanguageActions = {
  [BCMSStoreActionTypes.language_set]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.language_set, payload);
  },
  [BCMSStoreActionTypes.language_remove]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.language_remove, payload);
  },
};
