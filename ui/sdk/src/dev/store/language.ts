import type { BCMSLanguage } from '../../types';
import {
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreLanguageGetters,
  BCMSStoreLanguageMutations,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSLanguage>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSLanguage>();

export const mutations: BCMSStoreLanguageMutations = {
  [BCMSStoreMutationTypes.language_set](state, payload) {
    defaultMutations.set(state.language, payload);
  },
  [BCMSStoreMutationTypes.language_remove](state, payload) {
    defaultMutations.remove(state.language, payload);
  },
};

export const getters: BCMSStoreLanguageGetters = {
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
