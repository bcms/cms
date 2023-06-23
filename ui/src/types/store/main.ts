import type {
  ActionContext,
  CommitOptions,
  DispatchOptions,
  Store as VuexStore,
} from 'vuex';
import type {
  BCMSStoreColorActions,
  BCMSStoreColorGetters,
  BCMSStoreColorMutations,
} from './color';
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
} from '@becomes/cms-sdk/types';
import type {
  BCMSStoreApiKeyActions,
  BCMSStoreApiKeyGetters,
  BCMSStoreApiKeyMutations,
} from './api-key';
import type {
  BCMSStoreEntryActions,
  BCMSStoreEntryGetters,
  BCMSStoreEntryMutations,
} from './entry';
import type {
  BCMSStoreEntryLiteActions,
  BCMSStoreEntryLiteGetters,
  BCMSStoreEntryLiteMutations,
} from './entry-lite';
import type {
  BCMSStoreGroupActions,
  BCMSStoreGroupGetters,
  BCMSStoreGroupMutations,
} from './group';
import type {
  BCMSStoreGroupLiteActions,
  BCMSStoreGroupLiteGetters,
  BCMSStoreGroupLiteMutations,
} from './group-lite';
import type {
  BCMSStoreLanguageActions,
  BCMSStoreLanguageGetters,
  BCMSStoreLanguageMutations,
} from './language';
import type {
  BCMSStoreMediaActions,
  BCMSStoreMediaGetters,
  BCMSStoreMediaMutations,
} from './media';
import type {
  BCMSStoreStatusActions,
  BCMSStoreStatusGetters,
  BCMSStoreStatusMutations,
} from './status';
import type {
  BCMSStoreTemplateActions,
  BCMSStoreTemplateGetters,
  BCMSStoreTemplateMutations,
} from './template';
import type {
  BCMSStoreTemplateOrganizerActions,
  BCMSStoreTemplateOrganizerGetters,
  BCMSStoreTemplateOrganizerMutations,
} from './template-organizer';
import type {
  BCMSStoreUserActions,
  BCMSStoreUserGetters,
  BCMSStoreUserMutations,
} from './user';
import type {
  BCMSStoreWidgetActions,
  BCMSStoreWidgetGetters,
  BCMSStoreWidgetMutations,
} from './widget';
import type {
  BCMSStoreTagActions,
  BCMSStoreTagGetters,
  BCMSStoreTagMutations,
} from '.';
import type {
  BCMSStoreBackupItemActions,
  BCMSStoreBackupItemGetters,
  BCMSStoreBackupItemMutations,
} from './backup-item';
import type { BCMSFeature } from '../models';
import type {
  BCMSStoreFeatureActions,
  BCMSStoreFeatureGetters,
  BCMSStoreFeatureMutations,
} from './feature';

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
  feature: BCMSFeature[];
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
  BCMSStoreBackupItemMutations &
  BCMSStoreFeatureMutations;

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
  BCMSStoreBackupItemGetters &
  BCMSStoreFeatureGetters;

export type BCMSStoreActionAugments = Omit<
  ActionContext<BCMSStoreState, BCMSStoreState>,
  'commit'
> & {
  commit<K extends keyof BCMSStoreMutations>(
    key: K,
    payload: Parameters<BCMSStoreMutations[K]>[1]
  ): ReturnType<BCMSStoreMutations[K]>;
};

export type BCMSStoreActions = BCMSStoreUserActions &
  BCMSStoreApiKeyActions &
  BCMSStoreLanguageActions &
  BCMSStoreStatusActions &
  BCMSStoreGroupActions &
  BCMSStoreGroupLiteActions &
  BCMSStoreWidgetActions &
  BCMSStoreMediaActions &
  BCMSStoreTemplateActions &
  BCMSStoreEntryLiteActions &
  BCMSStoreEntryActions &
  BCMSStoreTemplateOrganizerActions &
  BCMSStoreColorActions &
  BCMSStoreTagActions &
  BCMSStoreBackupItemActions &
  BCMSStoreFeatureActions;

export type BCMSStore = Omit<
  VuexStore<BCMSStoreState>,
  'getters' | 'commit' | 'dispatch'
> & {
  commit<
    K extends keyof BCMSStoreMutations,
    P extends Parameters<BCMSStoreMutations[K]>[1]
  >(
    key: K,
    payload: P,
    options?: CommitOptions
  ): ReturnType<BCMSStoreMutations[K]>;
} & {
  dispatch<K extends keyof BCMSStoreActions>(
    key: K,
    payload?: Parameters<BCMSStoreActions[K]>[1],
    options?: DispatchOptions
  ): ReturnType<BCMSStoreActions[K]>;
} & {
  getters: {
    [K in keyof BCMSStoreGetters]: ReturnType<BCMSStoreGetters[K]>;
  };
};
