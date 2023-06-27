import type { BCMSStatus } from '../../types';
import {
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreStatusGetters,
  BCMSStoreStatusMutations,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSStatus>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSStatus>();

export const mutations: BCMSStoreStatusMutations = {
  [BCMSStoreMutationTypes.status_set](state, payload) {
    defaultMutations.set(state.status, payload);
  },
  [BCMSStoreMutationTypes.status_remove](state, payload) {
    defaultMutations.remove(state.status, payload);
  },
};

export const getters: BCMSStoreStatusGetters = {
  [BCMSStoreGetterTypes.status_items](state) {
    return state.status;
  },
  [BCMSStoreGetterTypes.status_find](state) {
    return (query) => {
      return defaultGetters.find(state.status, query);
    };
  },
  [BCMSStoreGetterTypes.status_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.status, query);
    };
  },
};
