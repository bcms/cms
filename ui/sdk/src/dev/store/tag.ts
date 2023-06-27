import type { BCMSTag } from "../../types";
import { BCMSStoreGetterTypes, BCMSStoreMutationTypes } from "../types";
import type { BCMSStoreTagGetters, BCMSStoreTagMutations } from "../types/tag";
import { defaultEntryGetters, defaultEntryMutations } from "./_defaults";


const defaultMutations = defaultEntryMutations<BCMSTag>((item) => {
    return item._id;
  });
  const defaultGetters = defaultEntryGetters<BCMSTag>();
  
  export const mutations: BCMSStoreTagMutations = {
    [BCMSStoreMutationTypes.tag_set](state, payload) {
      defaultMutations.set(state.tag, payload);
    },
    [BCMSStoreMutationTypes.tag_remove](state, payload) {
      defaultMutations.remove(state.tag, payload);
    },
  };
  export const getters: BCMSStoreTagGetters = {
    [BCMSStoreGetterTypes.tag_items](state) {
      return state.color;
    },
    [BCMSStoreGetterTypes.tag_find](state) {
      return (query) => {
        return defaultGetters.find(state.tag, query);
      };
    },
    [BCMSStoreGetterTypes.tag_findOne](state) {
      return (query) => {
        return defaultGetters.findOne(state.tag, query);
      };
    },
  };