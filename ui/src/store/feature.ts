import type { MutationTree, GetterTree, ActionTree } from 'vuex';
import type {
  BCMSStoreState,
  BCMSStoreFeatureActions,
  BCMSStoreFeatureGetters,
  BCMSStoreFeatureMutations,
  BCMSFeature,
} from '../types';
import {
  BCMSStoreActionTypes,
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSFeature>((item) => {
  return item._id;
});
const defaultGetters = defaultEntryGetters<BCMSFeature>();

export const mutations: MutationTree<BCMSStoreState> &
  BCMSStoreFeatureMutations = {
  [BCMSStoreMutationTypes.feature_set](state, payload) {
    defaultMutations.set(state.feature, payload);
  },
  [BCMSStoreMutationTypes.feature_remove](state, payload) {
    defaultMutations.remove(state.feature, payload);
  },
};

export const getters: GetterTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreFeatureGetters = {
  [BCMSStoreGetterTypes.feature_items](state) {
    return state.feature;
  },
  [BCMSStoreGetterTypes.feature_find](state) {
    return (query) => {
      return defaultGetters.find(state.feature, query);
    };
  },
  [BCMSStoreGetterTypes.feature_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.feature, query);
    };
  },
  [BCMSStoreGetterTypes.feature_available](state) {
    return (name) => {
      const feat = state.feature.find((e) => e.name === name);
      if (!feat) {
        return false;
      }
      if (feat.available === true) {
        return true;
      }
      return false;
    };
  },
};

export const actions: ActionTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreFeatureActions = {
  [BCMSStoreActionTypes.feature_set]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.feature_set, payload);
  },
  [BCMSStoreActionTypes.feature_remove]({ commit }, payload) {
    commit(BCMSStoreMutationTypes.feature_remove, payload);
  },
};
