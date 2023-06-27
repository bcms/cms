import type { BCMSTemplate } from '../../types';
import {
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreTemplateGetters,
  BCMSStoreTemplateMutations,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSTemplate>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSTemplate>();

export const mutations: BCMSStoreTemplateMutations = {
  [BCMSStoreMutationTypes.template_set](state, payload) {
    defaultMutations.set(state.template, payload);
  },
  [BCMSStoreMutationTypes.template_remove](state, payload) {
    defaultMutations.remove(state.template, payload);
  },
};

export const getters: BCMSStoreTemplateGetters = {
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
