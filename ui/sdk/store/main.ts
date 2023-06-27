import {
  ActionTree,
  createLogger,
  createStore,
  GetterTree,
  MutationTree,
} from 'vuex';
import type {
  BCMSStore,
  BCMSStoreActions,
  BCMSStoreGetters,
  BCMSStoreMutations,
  BCMSStoreState,
} from '../src/types';
import * as UserStore from './user';
import * as ApiKeyStore from './api-key';
import * as LanguageStore from './language';
import * as StatusStore from './status';
import * as GroupStore from './group';
import * as GroupLiteStore from './group-lite';
import * as WidgetStore from './widget';
import * as MediaStore from './media';
import * as TemplateStore from './template';
import * as EntryLiteStore from './entry-lite';
import * as EntryStore from './entry';
import * as TempOrgStore from './template-organizer';
import * as ColorStore from './color';
export const state: BCMSStoreState = {
  user: [],
  apiKey: [],
  language: [],
  status: [],
  group: [],
  groupLite: [],
  widget: [],
  media: [],
  template: [],
  entryLite: [],
  entry: [],
  templateOrganizer: [],
  color: [],
};

export const mutations: MutationTree<BCMSStoreState> & BCMSStoreMutations = {
  ...UserStore.mutations,
  ...ApiKeyStore.mutations,
  ...LanguageStore.mutations,
  ...StatusStore.mutations,
  ...GroupStore.mutations,
  ...GroupLiteStore.mutations,
  ...WidgetStore.mutations,
  ...MediaStore.mutations,
  ...TemplateStore.mutations,
  ...EntryLiteStore.mutations,
  ...EntryStore.mutations,
  ...TempOrgStore.mutations,
  ...ColorStore.mutations,
};
export const getters: GetterTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreGetters = {
  ...UserStore.getters,
  ...ApiKeyStore.getters,
  ...LanguageStore.getters,
  ...StatusStore.getters,
  ...GroupStore.getters,
  ...GroupLiteStore.getters,
  ...WidgetStore.getters,
  ...MediaStore.getters,
  ...TemplateStore.getters,
  ...EntryLiteStore.getters,
  ...EntryStore.getters,
  ...TempOrgStore.getters,
  ...ColorStore.getters,
};
export const actions: ActionTree<BCMSStoreState, BCMSStoreState> &
  BCMSStoreActions = {
  ...UserStore.actions,
  ...ApiKeyStore.actions,
  ...LanguageStore.actions,
  ...StatusStore.actions,
  ...GroupStore.actions,
  ...GroupLiteStore.actions,
  ...WidgetStore.actions,
  ...MediaStore.actions,
  ...TemplateStore.actions,
  ...EntryLiteStore.actions,
  ...EntryStore.actions,
  ...TempOrgStore.actions,
  ...ColorStore.actions,
};

export const bcmsStore = createStore<BCMSStoreState>({
  state,
  mutations,
  getters,
  plugins: window.location.href.indexOf('localhost:8080')
    ? [createLogger()]
    : undefined,
});

export function useBcmsStore(): BCMSStore {
  return bcmsStore;
}
