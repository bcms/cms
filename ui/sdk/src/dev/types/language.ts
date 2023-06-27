import type { BCMSLanguage } from '../../types';
import type { BCMSStoreGetterTypes, BCMSStoreMutationTypes } from './enums';
import type { BCMSStoreGetterQuery, BCMSStoreState } from './main';

type EntityItem = BCMSLanguage;

export interface BCMSStoreLanguageMutations {
  [BCMSStoreMutationTypes.language_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
  [BCMSStoreMutationTypes.language_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
}
export interface BCMSStoreLanguageGetters {
  [BCMSStoreGetterTypes.language_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.language_find](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.language_findOne](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
