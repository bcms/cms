import type { BCMSMedia } from '../models';

/**
 * Get media binary data function.
 */
export interface BCMSClientMediaBinFn {
  (data?: { onProgress?(progress: number): void }): Promise<ArrayBuffer>;
}

/**
 * Extended media response object.
 */
export interface BCMSClientMediaResponseItem extends BCMSMedia {
  bin: BCMSClientMediaBinFn;
}

/**
 * The BCMS media API handler.
 */
export interface BCMSClientMediaHandler {
  /**
   * Get all media objects.
   */
  getAll(data?: {
    /**
     * If cache is enabled, this option provides a way
     * to skip it when sending a request to the BCMS.
     */
    skipCache?: boolean;
  }): Promise<BCMSClientMediaResponseItem[]>;
  /**
   * Get a specific media object.
   */
  get(
    /**
     * ID of a media.
     */
    id: string,
    /**
     * If cache is enabled, this option provides a way
     * to skip it when sending a request to the BCMS.
     */
    skipCache?: boolean,
  ): Promise<BCMSClientMediaResponseItem>;
  /**
   * Get a binary data of a specific media object.
   */
  download(
    /**
     * ID of a media.
     */
    id: string,
    /**
     * If cache is enabled, this option provides a way
     * to skip it when sending a request to the BCMS.
     */
    skipCache?: boolean,
  ): Promise<ArrayBuffer>;
}
