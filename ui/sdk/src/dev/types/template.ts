import type { BCMSTemplate } from '../../types';
import type { BCMSStoreGetterTypes, BCMSStoreMutationTypes } from './enums';
import type { BCMSStoreGetterQuery, BCMSStoreState } from './main';

type EntityItem = BCMSTemplate;

export interface BCMSStoreTemplateMutations {
  [BCMSStoreMutationTypes.template_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
  [BCMSStoreMutationTypes.template_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
}
export interface BCMSStoreTemplateGetters {
  [BCMSStoreGetterTypes.template_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.template_find](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.template_findOne](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
