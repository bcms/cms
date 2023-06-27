import type {
  BCMSClientTypeConverterLanguage,
  BCMSTypeConverterResultItem,
} from '../models';

/**
 * The BCMS type converter API handler.
 */
export interface BCMSClientTypeConverterHandler {
  /**
   * Get all types.
   */
  getAll(data: {
    /**
     * Language to format types in.
     */
    language: BCMSClientTypeConverterLanguage;
  }): Promise<BCMSTypeConverterResultItem[]>;
  /**
   * Get types for specific item.
   */
  get(data: {
    /**
     * Language to format types in.
     */
    language: BCMSClientTypeConverterLanguage;
    /**
     * ID of an item for which to return types.
     */
    itemId: string;
    /**
     * Type of the item.
     */
    itemType: 'entry' | 'group' | 'widget' | 'enum' | 'template';
  }): Promise<BCMSTypeConverterResultItem[]>;
}
