import type { BCMSTemplateOrganizer } from '@becomes/cms-sdk/types';
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

type EntityItem = BCMSTemplateOrganizer;

export interface BCMSStoreTemplateOrganizerMutations {
  [BCMSStoreMutationTypes.templateOrganizer_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[]
  ): void;
  [BCMSStoreMutationTypes.templateOrganizer_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[]
  ): void;
}
export interface BCMSStoreTemplateOrganizerGetters {
  [BCMSStoreGetterTypes.templateOrganizer_items](
    state: BCMSStoreState
  ): EntityItem[];
  [BCMSStoreGetterTypes.templateOrganizer_find](
    state: BCMSStoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.templateOrganizer_findOne](
    state: BCMSStoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
export interface BCMSStoreTemplateOrganizerActions {
  [BCMSStoreActionTypes.templateOrganizer_set](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem[]
  ): void;
  [BCMSStoreActionTypes.templateOrganizer_remove](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem | EntityItem[]
  ): void;
}
