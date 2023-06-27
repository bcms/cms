import type { BCMSTemplateOrganizer } from '../../types';
import {
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
  BCMSStoreTemplateOrganizerGetters,
  BCMSStoreTemplateOrganizerMutations,
} from '../types';
import { defaultEntryGetters, defaultEntryMutations } from './_defaults';

const defaultMutations = defaultEntryMutations<BCMSTemplateOrganizer>(
  (item) => {
    return item._id;
  },
);
const defaultGetters = defaultEntryGetters<BCMSTemplateOrganizer>();

export const mutations: BCMSStoreTemplateOrganizerMutations = {
  [BCMSStoreMutationTypes.templateOrganizer_set](state, payload) {
    defaultMutations.set(state.templateOrganizer, payload);
  },
  [BCMSStoreMutationTypes.templateOrganizer_remove](state, payload) {
    defaultMutations.remove(state.templateOrganizer, payload);
  },
};

export const getters: BCMSStoreTemplateOrganizerGetters = {
  [BCMSStoreGetterTypes.templateOrganizer_items](state) {
    return state.templateOrganizer;
  },
  [BCMSStoreGetterTypes.templateOrganizer_find](state) {
    return (query) => {
      return defaultGetters.find(state.templateOrganizer, query);
    };
  },
  [BCMSStoreGetterTypes.templateOrganizer_findOne](state) {
    return (query) => {
      return defaultGetters.findOne(state.templateOrganizer, query);
    };
  },
};
