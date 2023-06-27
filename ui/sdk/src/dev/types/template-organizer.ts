import type { BCMSTemplateOrganizer } from '../../types';
import type { BCMSStoreGetterTypes, BCMSStoreMutationTypes } from './enums';
import type { BCMSStoreGetterQuery, BCMSStoreState } from './main';

type EntityItem = BCMSTemplateOrganizer;

export interface BCMSStoreTemplateOrganizerMutations {
  [BCMSStoreMutationTypes.templateOrganizer_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
  [BCMSStoreMutationTypes.templateOrganizer_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
}
export interface BCMSStoreTemplateOrganizerGetters {
  [BCMSStoreGetterTypes.templateOrganizer_items](
    state: BCMSStoreState,
  ): EntityItem[];
  [BCMSStoreGetterTypes.templateOrganizer_find](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.templateOrganizer_findOne](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
