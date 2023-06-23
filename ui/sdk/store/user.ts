import type { MutationTree, GetterTree, ActionTree } from 'vuex';
import {
  BCMSStoreActionTypes,
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreState,
  BCMSStoreUserActions,
  BCMSStoreUserGetters,
  BCMSStoreUserMutations,
  BCMSUser,
} from '../src/types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSUser>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSUser>();

export const mutations: MutationTree<BCMSStoreState> & BCMSStoreUserMutations =
  {
    [BCMSStoreMutationTypes.user_set](state, payload) {
      defaultMutations.set(state.user, payload);
    },
    [BCMSStoreMutationTypes.user_remove](state, payload) {
      defaultMutations.remove(state.user, payload);
    },
  };

export const getters: GetterTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreUserGetters = {
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

export const actions: ActionTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreUserActions = {
  [BCMSStoreActionTypes.user_set]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.user_set, payload);
  },
  [BCMSStoreActionTypes.user_remove]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.user_remove, payload);
  },
};
