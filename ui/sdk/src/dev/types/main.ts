import type { BCMSStoreColorGetters, BCMSStoreColorMutations } from '.';
import type {
  BCMSApiKey,
  BCMSBackupListItem,
  BCMSColor,
  BCMSEntry,
  BCMSEntryLite,
  BCMSGroup,
  BCMSGroupLite,
  BCMSLanguage,
  BCMSMedia,
  BCMSSdkCacheItem,
  BCMSStatus,
  BCMSTag,
  BCMSTemplate,
  BCMSTemplateOrganizer,
  BCMSUser,
  BCMSWidget,
} from '../../types';
import type {
  BCMSStoreApiKeyGetters,
  BCMSStoreApiKeyMutations,
} from './api-key';
import type {
  BCMSStoreBackupItemGetters,
  BCMSStoreBackupItemMutations,
} from './backup-item';
import type { BCMSStoreEntryGetters, BCMSStoreEntryMutations } from './entry';
import type {
  BCMSStoreEntryLiteGetters,
  BCMSStoreEntryLiteMutations,
} from './entry-lite';
import type { BCMSStoreGroupGetters, BCMSStoreGroupMutations } from './group';
import type {
  BCMSStoreGroupLiteGetters,
  BCMSStoreGroupLiteMutations,
} from './group-lite';
import type {
  BCMSStoreLanguageGetters,
  BCMSStoreLanguageMutations,
} from './language';
import type { BCMSStoreMediaGetters, BCMSStoreMediaMutations } from './media';
import type {
  BCMSStoreStatusGetters,
  BCMSStoreStatusMutations,
} from './status';
import type { BCMSStoreTagGetters, BCMSStoreTagMutations } from './tag';
import type {
  BCMSStoreTemplateGetters,
  BCMSStoreTemplateMutations,
} from './template';
import type {
  BCMSStoreTemplateOrganizerGetters,
  BCMSStoreTemplateOrganizerMutations,
} from './template-organizer';
import type { BCMSStoreUserGetters, BCMSStoreUserMutations } from './user';
import type {
  BCMSStoreWidgetGetters,
  BCMSStoreWidgetMutations,
} from './widget';

export interface BCMSStoreGetterQuery<Item extends BCMSSdkCacheItem> {
  (item: Item): boolean;
}

export interface BCMSStoreState {
  user: BCMSUser[];
  apiKey: BCMSApiKey[];
  language: BCMSLanguage[];
  status: BCMSStatus[];
  group: BCMSGroup[];
  groupLite: BCMSGroupLite[];
  widget: BCMSWidget[];
  media: BCMSMedia[];
  template: BCMSTemplate[];
  entry: BCMSEntry[];
  entryLite: BCMSEntryLite[];
  templateOrganizer: BCMSTemplateOrganizer[];
  color: BCMSColor[];
  tag: BCMSTag[];
  backupItem: BCMSBackupListItem[];
}

export type BCMSStoreMutations = BCMSStoreUserMutations &
  BCMSStoreApiKeyMutations &
  BCMSStoreLanguageMutations &
  BCMSStoreStatusMutations &
  BCMSStoreGroupMutations &
  BCMSStoreGroupLiteMutations &
  BCMSStoreWidgetMutations &
  BCMSStoreMediaMutations &
  BCMSStoreTemplateMutations &
  BCMSStoreEntryLiteMutations &
  BCMSStoreEntryMutations &
  BCMSStoreTemplateOrganizerMutations &
  BCMSStoreColorMutations &
  BCMSStoreTagMutations &
  BCMSStoreBackupItemMutations;

export type BCMSStoreGetters = BCMSStoreUserGetters &
  BCMSStoreApiKeyGetters &
  BCMSStoreLanguageGetters &
  BCMSStoreStatusGetters &
  BCMSStoreGroupGetters &
  BCMSStoreGroupLiteGetters &
  BCMSStoreWidgetGetters &
  BCMSStoreMediaGetters &
  BCMSStoreTemplateGetters &
  BCMSStoreEntryLiteGetters &
  BCMSStoreEntryGetters &
  BCMSStoreTemplateOrganizerGetters &
  BCMSStoreColorGetters &
  BCMSStoreTagGetters &
  BCMSStoreBackupItemGetters;

export interface BCMSStore {
  state: BCMSStoreState;
  mutations: BCMSStoreMutations;
  getters: BCMSStoreGetters;
}
