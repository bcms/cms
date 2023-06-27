import type { BCMSTemplate } from '@becomes/cms-sdk/types';
import type { MutationTree, GetterTree, ActionTree } from 'vuex';
import type {
  BCMSStoreState,
  BCMSStoreTemplateActions,
  BCMSStoreTemplateGetters,
  BCMSStoreTemplateMutations,
} from '../types';
import {
  BCMSStoreMutationTypes,
  BCMSStoreGetterTypes,
  BCMSStoreActionTypes,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSTemplate>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSTemplate>();

export const mutations: MutationTree<BCMSStoreState> &
  BCMSStoreTemplateMutations = {
  [BCMSStoreMutationTypes.template_set](state, payload) {
    defaultMutations.set(state.template, payload);
  },
  [BCMSStoreMutationTypes.template_remove](state, payload) {
    defaultMutations.remove(state.template, payload);
  },
};

export const getters: GetterTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreTemplateGetters = {
  [BCMSStoreGetterTypes.template_items](state) {
    return state.template;
  },
  [BCMSStoreGetterTypes.template_find](state) {
    return (query) => {
      return defaultGetters.find(state.template, query);
    };
  },
  [BCMSStoreGetterTypes.template_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.template, query);
    };
  },
};

export const actions: ActionTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreTemplateActions = {
  [BCMSStoreActionTypes.template_set]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.template_set, payload);
  },
  [BCMSStoreActionTypes.template_remove]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.template_remove, payload);
  },
};
