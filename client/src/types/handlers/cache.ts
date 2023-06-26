import type {
  BCMSEntry,
  BCMSEntryParsed,
  BCMSMedia,
  BCMSTemplate,
} from '../models';

/**
 * Cache item required properties.
 */
export interface BCMSClientCacheItem {
  _id: string;
}

/**
 * Cache handler query function.
 */
export interface BCMSClientCacheQuery<Item extends BCMSClientCacheItem> {
  (item: Item, items: Item[]): unknown;
}

/**
 * Cache container.
 */
export interface BCMSClientCache<Item extends BCMSClientCacheItem> {
  /**
   * Find all items matching the query
   */
  find(query: BCMSClientCacheQuery<Item>): Item[];
  /**
   * Find one/first item matching the query.
   */
  findOne(query: BCMSClientCacheQuery<Item>): Item | null;
  /**
   * Get all cached items.
   */
  items(): Item[];
  /**
   * Add/update 1 or more cache items.
   */
  set(items: Item | Item[]): void;
  /**
   * Delete 1 or more cache items. Items are matched by `_id`.
   */
  remove(
    item:
      | Item
      | Item[]
      | BCMSClientCacheItem
      | BCMSClientCacheItem[]
      | string
      | string[],
  ): void;
  all: boolean;
}

/**
 * Cache manager. Provides an access to all cache containers.
 */
export interface BCMSClientCacheManager {
  /**
   * Entries cache container.
   */
  entry: BCMSClientCache<BCMSEntry>;
  /**
   * Parsed entries cache container.
   */
  entryParsed: BCMSClientCache<BCMSEntryParsed>;
  /**
   * Templates cache container.
   */
  template: BCMSClientCache<BCMSTemplate>;
  /**
   * Media cache container.
   */
  media: BCMSClientCache<BCMSMedia>;
}
