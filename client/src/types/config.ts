export interface BCMSClientConfig {
  /**
   * Base URL to the BCMS: ex. https://INSTANCE_NAME.yourbcms.com
   */
  cmsOrigin: string;
  /**
   * API key for accessing the BCMS data
   */
  key: {
    id: string;
    secret: string;
  };
  /**
   * Use memory caching. If enabled, all responses from the BCMS
   * will be saved in memory and updated only if the data changes
   * in the BCMS (using sockets).
   *
   * **IMPORTANT**: This option should be enabled only on server side
   * because a BCMS cannot handle infinite number of socket connections.
   */
  enableCache?: boolean;
  /**
   * Print useful debug information.
   */
  debug?: boolean;
  userAgent?: {
    random?: boolean;
    randomPrefix?: string;
    exec?: string;
  };
  entries?: {
    allowStatuses?: string[];
  };
}
