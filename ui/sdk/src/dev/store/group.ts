import type { BCMSGroup } from '../../types';
import {
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreGroupGetters,
  BCMSStoreGroupMutations,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSGroup>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSGroup>();

export const mutations: BCMSStoreGroupMutations = {
  [BCMSStoreMutationTypes.group_set](state, payload) {
    defaultMutations.set(state.group, payload);
  },
  [BCMSStoreMutationTypes.group_remove](state, payload) {
    defaultMutations.remove(state.group, payload);
  },
};

export const getters: BCMSStoreGroupGetters = {
  [BCMSStoreGetterTypes.group_items](state) {
    return state.group;
  },
  [BCMSStoreGetterTypes.group_find](state) {
    return (query) => {
      return defaultGetters.find(state.group, query);
    };
  },
  [BCMSStoreGetterTypes.group_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.group, query);
    };
  },
};
