import type { BCMSGroupLite } from '../../types';
import {
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreGroupLiteGetters,
  BCMSStoreGroupLiteMutations,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSGroupLite>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSGroupLite>();

export const mutations: BCMSStoreGroupLiteMutations = {
  [BCMSStoreMutationTypes.groupLite_set](state, payload) {
    defaultMutations.set(state.groupLite, payload);
  },
  [BCMSStoreMutationTypes.groupLite_remove](state, payload) {
    defaultMutations.remove(state.groupLite, payload);
  },
};

export const getters: BCMSStoreGroupLiteGetters = {
  [BCMSStoreGetterTypes.groupLite_items](state) {
    return state.groupLite;
  },
  [BCMSStoreGetterTypes.groupLite_find](state) {
    return (query) => {
      return defaultGetters.find(state.groupLite, query);
    };
  },
  [BCMSStoreGetterTypes.groupLite_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.groupLite, query);
    };
  },
};
