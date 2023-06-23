export interface BCMSSdkCacheItem {
  _id: string;
}

export interface BCMSSdkCacheQuery<Item extends BCMSSdkCacheItem> {
  (item: Item): boolean;
}

export const BCMSSdkCacheDataNames = [
  'apiKey',
  'color',
  'entry',
  'entryLite',
  'group',
  'groupLite',
  'language',
  'media',
  'status',
  'templateOrganizer',
  'template',
  'user',
  'widget',
  'tag',
  'backupItem',
];
export type BCMSSdkCacheDataName =
  | 'apiKey'
  | 'color'
  | 'entry'
  | 'entryLite'
  | 'group'
  | 'groupLite'
  | 'language'
  | 'media'
  | 'status'
  | 'templateOrganizer'
  | 'template'
  | 'user'
  | 'widget'
  | 'tag'
  | 'backupItem';

export interface BCMSSdkCacheData {
  name: BCMSSdkCacheDataName;
}

export interface BCMSSdkCacheConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromVuex?: any;
  custom?: BCMSSdkCache;
}

export interface BCMSSdkCache {
  mutations: {
    set<Item extends BCMSSdkCacheItem>(
      data: {
        payload: Item | Item[];
      } & BCMSSdkCacheData,
    ): void;
    remove<Item extends BCMSSdkCacheItem>(
      data: { payload: Item | Item[] } & BCMSSdkCacheData,
    ): void;
  };
  getters: {
    items<Item extends BCMSSdkCacheItem>(data: BCMSSdkCacheData): Item[];
    find<Item extends BCMSSdkCacheItem>(
      data: { query: BCMSSdkCacheQuery<Item> } & BCMSSdkCacheData,
    ): Item[];
    findOne<Item extends BCMSSdkCacheItem>(
      data: {
        query: BCMSSdkCacheQuery<Item>;
      } & BCMSSdkCacheData,
    ): Item | undefined;
  };
}
