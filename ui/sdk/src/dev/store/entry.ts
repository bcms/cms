import type { BCMSEntry } from '../../types';
import {
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreEntryGetters,
  BCMSStoreEntryMutations,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSEntry>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSEntry>();

export const mutations: BCMSStoreEntryMutations = {
  [BCMSStoreMutationTypes.entry_set](state, payload) {
    defaultMutations.set(state.entry, payload);
  },
  [BCMSStoreMutationTypes.entry_remove](state, payload) {
    defaultMutations.remove(state.entry, payload);
  },
};

export const getters: BCMSStoreEntryGetters = {
  [BCMSStoreGetterTypes.entry_items](state) {
    return state.entry;
  },
  [BCMSStoreGetterTypes.entry_find](state) {
    return (query) => {
      return defaultGetters.find(state.entry, query);
    };
  },
  [BCMSStoreGetterTypes.entry_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.entry, query);
    };
  },
};
