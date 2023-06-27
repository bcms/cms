import type { BCMSWidget } from '../models';
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
export interface BCMSStoreWidgetActions {
  [BCMSStoreActionTypes.widget_set](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem[],
  ): void;
  [BCMSStoreActionTypes.widget_remove](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem | EntityItem[],
  ): void;
}
