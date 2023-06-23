import type { BCMSStore } from '../types';

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
import * as TagStore from './tag';
import * as BackupItemStore from './backup-item';

export const store: BCMSStore = {
  state: {
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
    tag: [],
    backupItem: [],
  },
  mutations: {
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
    ...TagStore.mutations,
    ...BackupItemStore.mutations,
  },
  getters: {
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
    ...TagStore.getters,
    ...BackupItemStore.getters,
  },
};
