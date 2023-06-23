import type { BCMSWidget } from '@becomes/cms-sdk/types';
import type { MutationTree, GetterTree, ActionTree } from 'vuex';
import type {
  BCMSStoreState,
  BCMSStoreWidgetActions,
  BCMSStoreWidgetGetters,
  BCMSStoreWidgetMutations,
} from '../types';
import {
  BCMSStoreMutationTypes,
  BCMSStoreGetterTypes,
  BCMSStoreActionTypes,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSWidget>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSWidget>();

export const mutations: MutationTree<BCMSStoreState> &
  BCMSStoreWidgetMutations = {
  [BCMSStoreMutationTypes.widget_set](state, payload) {
    defaultMutations.set(state.widget, payload);
  },
  [BCMSStoreMutationTypes.widget_remove](state, payload) {
    defaultMutations.remove(state.widget, payload);
  },
};

export const getters: GetterTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreWidgetGetters = {
  [BCMSStoreGetterTypes.widget_items](state) {
    return state.widget;
  },
  [BCMSStoreGetterTypes.widget_find](state) {
    return (query) => {
      return defaultGetters.find(state.widget, query);
    };
  },
  [BCMSStoreGetterTypes.widget_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.widget, query);
    };
  },
};

export const actions: ActionTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreWidgetActions = {
  [BCMSStoreActionTypes.widget_set]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.widget_set, payload);
  },
  [BCMSStoreActionTypes.widget_remove]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.widget_remove, payload);
  },
};
