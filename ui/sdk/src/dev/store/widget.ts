import type { BCMSWidget } from '../../types';
import {
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreWidgetGetters,
  BCMSStoreWidgetMutations,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSWidget>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSWidget>();

export const mutations: BCMSStoreWidgetMutations = {
  [BCMSStoreMutationTypes.widget_set](state, payload) {
    defaultMutations.set(state.widget, payload);
  },
  [BCMSStoreMutationTypes.widget_remove](state, payload) {
    defaultMutations.remove(state.widget, payload);
  },
};

export const getters: BCMSStoreWidgetGetters = {
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
