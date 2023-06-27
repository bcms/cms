import type { MutationTree, GetterTree, ActionTree } from 'vuex';
import {
  BCMSTemplateOrganizer,
  BCMSStoreActionTypes,
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreState,
  BCMSStoreTemplateOrganizerActions,
  BCMSStoreTemplateOrganizerGetters,
  BCMSStoreTemplateOrganizerMutations,
} from '../src/types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSTemplateOrganizer>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSTemplateOrganizer>();

export const mutations: MutationTree<BCMSStoreState> &
  BCMSStoreTemplateOrganizerMutations = {
  [BCMSStoreMutationTypes.templateOrganizer_set](state, payload) {
    defaultMutations.set(state.templateOrganizer, payload);
  },
  [BCMSStoreMutationTypes.templateOrganizer_remove](state, payload) {
    defaultMutations.remove(state.templateOrganizer, payload);
  },
};

export const getters: GetterTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreTemplateOrganizerGetters = {
  [BCMSStoreGetterTypes.templateOrganizer_items](state) {
    return state.templateOrganizer;
  },
  [BCMSStoreGetterTypes.templateOrganizer_find](state) {
    return (query) => {
      return defaultGetters.find(state.templateOrganizer, query);
    };
  },
  [BCMSStoreGetterTypes.templateOrganizer_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.templateOrganizer, query);
    };
  },
};

export const actions: ActionTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreTemplateOrganizerActions = {
  [BCMSStoreActionTypes.templateOrganizer_set]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.templateOrganizer_set, payload);
  },
  [BCMSStoreActionTypes.templateOrganizer_remove]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.templateOrganizer_remove, payload);
  },
};
