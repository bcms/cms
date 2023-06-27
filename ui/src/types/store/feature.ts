import type { BCMSFeature } from '../models';
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

type EntityItem = BCMSFeature;

export interface BCMSStoreFeatureMutations {
  [BCMSStoreMutationTypes.feature_set](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[]
  ): void;
  [BCMSStoreMutationTypes.feature_remove](
    state: BCMSStoreState,
    payload: EntityItem | EntityItem[]
  ): void;
}
export interface BCMSStoreFeatureGetters {
  [BCMSStoreGetterTypes.feature_items](state: BCMSStoreState): EntityItem[];
  [BCMSStoreGetterTypes.feature_find](
    state: BCMSStoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem[];
  [BCMSStoreGetterTypes.feature_findOne](
    state: BCMSStoreState
  ): (query: BCMSStoreGetterQuery<EntityItem>) => EntityItem | undefined;
  [BCMSStoreGetterTypes.feature_available](
    state: BCMSStoreState
  ): (name: string) => boolean;
}
export interface BCMSStoreFeatureActions {
  [BCMSStoreActionTypes.feature_set](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem[]
  ): void;
  [BCMSStoreActionTypes.feature_remove](
    ctx: BCMSStoreActionAugments,
    payload: EntityItem | EntityItem[]
  ): void;
}
