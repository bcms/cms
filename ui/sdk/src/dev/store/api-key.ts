import type { BCMSApiKey } from '../../types';
import {
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreApiKeyGetters,
  BCMSStoreApiKeyMutations,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSApiKey>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSApiKey>();

export const mutations: BCMSStoreApiKeyMutations = {
  [BCMSStoreMutationTypes.apiKey_set](state, payload) {
    defaultMutations.set(state.apiKey, payload);
  },
  [BCMSStoreMutationTypes.apiKey_remove](state, payload) {
    defaultMutations.remove(state.apiKey, payload);
  },
};

export const getters: BCMSStoreApiKeyGetters = {
  [BCMSStoreGetterTypes.apiKey_items](state) {
    return state.apiKey;
  },
  [BCMSStoreGetterTypes.apiKey_find](state) {
    return (query) => {
      return defaultGetters.find(state.apiKey, query);
    };
  },
  [BCMSStoreGetterTypes.apiKey_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.apiKey, query);
    };
  },
};
