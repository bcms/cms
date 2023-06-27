import type { BCMSTemplate } from '../models';

/**
 * The BCMS templates API handler.
 */
export interface BCMSClientTemplateHandler {
  /**
   * Get a specific template.
   */
  get(data: {
    /**
     * Template ID or name.
     */
    template: string;
    /**
     * If cache is enabled, this option provides a way
     * to skip it when sending a request to the BCMS.
     */
    skipCache?: boolean;
  }): Promise<BCMSTemplate>;
  /**
   * Get all templates.
   */
  getAll(data?: {
    /**
     * If cache is enabled, this option provides a way
     * to skip it when sending a request to the BCMS.
     */
    skipCache?: boolean;
  }): Promise<BCMSTemplate[]>;
}
