import type { BCMSLanguage } from '@becomes/cms-sdk/types';
import type {
  BCMSStoreActionTypes,
  BCMSStoreGetterTypes,
  BCMSStoreMutationTypes,
} from './enums';
import type {
  BCMSStoreActionAugments,
  BCMSStoreGetterQuery,
  BCMSStoreState,
} from './main';

type EntityItem = BCMSLanguage;

export interface BCMSStoreLanguageMutations {
  [BCMSStoreMutationTypes.language_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[]
  ): void;
  [BCMSStoreMutationTypes.language_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[]
  ): void;
}
export interface BCMSStoreLanguageGetters {
  [BCMSStoreGetterTypes.language_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.language_find](
    state: BCMSStoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.language_findOne](
    state: BCMSStoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
export interface BCMSStoreLanguageActions {
  [BCMSStoreActionTypes.language_set](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem[]
  ): void;
  [BCMSStoreActionTypes.language_remove](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem | EntityItem[]
  ): void;
}
