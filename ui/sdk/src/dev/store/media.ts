import type { BCMSMedia } from '../../types';
import {
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreMediaGetters,
  BCMSStoreMediaMutations,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSMedia>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSMedia>();

export const mutations: BCMSStoreMediaMutations = {
  [BCMSStoreMutationTypes.media_set](state, payload) {
    defaultMutations.set(state.media, payload);
  },
  [BCMSStoreMutationTypes.media_remove](state, payload) {
    defaultMutations.remove(state.media, payload);
  },
};

export const getters: BCMSStoreMediaGetters = {
  [BCMSStoreGetterTypes.media_items](state) {
    return state.media;
  },
  [BCMSStoreGetterTypes.media_find](state) {
    return (query) => {
      return defaultGetters.find(state.media, query);
    };
  },
  [BCMSStoreGetterTypes.media_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.media, query);
    };
  },
};
