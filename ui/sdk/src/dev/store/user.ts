import type { BCMSUser } from '../../types';
import {
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreUserGetters,
  BCMSStoreUserMutations,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSUser>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSUser>();

export const mutations: BCMSStoreUserMutations = {
  [BCMSStoreMutationTypes.user_set](state, payload) {
    defaultMutations.set(state.user, payload);
  },
  [BCMSStoreMutationTypes.user_remove](state, payload) {
    defaultMutations.remove(state.user, payload);
  },
};

export const getters: BCMSStoreUserGetters = {
  [BCMSStoreGetterTypes.user_items](state) {
    return state.user;
  },
  [BCMSStoreGetterTypes.user_me](state) {
    // TODO: add logic for getting currently logged in user
    return state.user[0];
  },
  [BCMSStoreGetterTypes.user_find](state) {
    return (query) => {
      return defaultGetters.find(state.user, query);
    };
  },
  [BCMSStoreGetterTypes.user_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.user, query);
    };
  },
};
