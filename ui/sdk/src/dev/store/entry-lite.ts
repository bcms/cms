import type { BCMSEntryLite } from '../../types';
import {
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreEntryLiteGetters,
  BCMSStoreEntryLiteMutations,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSEntryLite>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSEntryLite>();

export const mutations: BCMSStoreEntryLiteMutations = {
  [BCMSStoreMutationTypes.entryLite_set](state, payload) {
    defaultMutations.set(state.entryLite, payload);
  },
  [BCMSStoreMutationTypes.entryLite_remove](state, payload) {
    defaultMutations.remove(state.entryLite, payload);
  },
};

export const getters: BCMSStoreEntryLiteGetters = {
  [BCMSStoreGetterTypes.entryLite_items](state) {
    return state.entryLite;
  },
  [BCMSStoreGetterTypes.entryLite_find](state) {
    return (query) => {
      return defaultGetters.find(state.entryLite, query);
    };
  },
  [BCMSStoreGetterTypes.entryLite_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.entryLite, query);
    };
  },
};
