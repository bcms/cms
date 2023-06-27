import type { BCMSWidget } from '../../types';
import type { BCMSStoreGetterTypes, BCMSStoreMutationTypes } from './enums';
import type { BCMSStoreGetterQuery, BCMSStoreState } from './main';

type EntityItem = BCMSWidget;

export interface BCMSStoreWidgetMutations {
  [BCMSStoreMutationTypes.widget_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
  [BCMSStoreMutationTypes.widget_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[],
  ): void;
}
export interface BCMSStoreWidgetGetters {
  [BCMSStoreGetterTypes.widget_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.widget_find](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.widget_findOne](
    state: BCMSStoreState,
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
}
