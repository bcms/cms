import type {
  BCMSEntryParsed,
  BCMSEntry,
  BCMSEntryCreateData,
  BCMSEntryUpdateData,
} from '../models';

/**
 * The BCMS entries API handler.
 */
export interface BCMSClientEntryHandler {
  /**
   * Get all parsed entries for specified template and language.
   */
  getAll(data: {
    /**
     * Template ID or name.
     */
    template: string;
    /**
     * Language code. If not provided, defaults to **en**
     */
    lng?: string;
    /**
     * How deep should the parser go. Defaults to 1.
     */
    maxDepth?: number;
    /**
     * If cache is enabled, this option provides a way
     * to skip it when sending a request to the BCMS.
     */
    skipCache?: boolean;
    skipStatusCheck?: boolean;
  }): Promise<BCMSEntryParsed[]>;
  /**
   * Get all entries for specified template and language.
   */
  getAllRaw(data: {
    /**
     * Template ID or name.
     */
    template: string;
    /**
     * Language code. If not provided, defaults to **en**
     */
    lng?: string;
    /**
     * If cache is enabled, this option provides a way
     * to skip it when sending a request to the BCMS.
     */
    skipCache?: boolean;
    skipStatusCheck?: boolean;
  }): Promise<BCMSEntry[]>;
  /**
   * Get a single parsed entry by template and entry ID or slug.
   */
  get(data: {
    /**
     * Template ID or name.
     */
    template: string;
    /**
     * Entry ID or slug.
     */
    entry: string;
    /**
     * Language code. If not provided, defaults to **en**
     */
    lng?: string;
    maxDepth?: number;
    /**
     * If cache is enabled, this option provides a way
     * to skip it when sending a request to the BCMS.
     */
    skipCache?: boolean;
    skipStatusCheck?: boolean;
  }): Promise<BCMSEntryParsed>;
  /**
   * Get a single entry by template and entry ID or slug.
   */
  getRaw(data: {
    /**
     * Template ID or name.
     */
    template: string;
    /**
     * Entry ID or slug.
     */
    entry: string;
    /**
     * Language code. If not provided, defaults to **en**
     */
    lng?: string;
    /**
     * If cache is enabled, this option provides a way
     * to skip it when sending a request to the BCMS.
     */
    skipCache?: boolean;
    skipStatusCheck?: boolean;
  }): Promise<BCMSEntry>;

  /**
   * Create an Entry.
   */
  create(data: BCMSEntryCreateData): Promise<BCMSEntry>;

  /**
   * Update existing Entry.
   */
  update(data: BCMSEntryUpdateData): Promise<BCMSEntry>;

  /**
   * Delete existing Entry.
   */
  deleteById(data: { _id: string; templateId: string }): Promise<void>;
}
