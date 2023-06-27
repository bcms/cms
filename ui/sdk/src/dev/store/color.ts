import type { BCMSColor } from '../../types';
import {
  BCMSStoreColorGetters,
  BCMSStoreColorMutations,
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSColor>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSColor>();

export const mutations: BCMSStoreColorMutations = {
  [BCMSStoreMutationTypes.color_set](state, payload) {
    defaultMutations.set(state.color, payload);
  },
  [BCMSStoreMutationTypes.color_remove](state, payload) {
    defaultMutations.remove(state.color, payload);
  },
};
export const getters: BCMSStoreColorGetters = {
  [BCMSStoreGetterTypes.color_items](state) {
    return state.color;
  },
  [BCMSStoreGetterTypes.color_find](state) {
    return (query) => {
      return defaultGetters.find(state.color, query);
    };
  },
  [BCMSStoreGetterTypes.color_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.color, query);
    };
  },
};
