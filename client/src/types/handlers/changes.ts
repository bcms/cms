export interface BCMSClientChangesGetInfoDataProp {
  count: number;
  lastChangeAt: number;
}

export interface BCMSClientChangesGetInfoData {
  entry: BCMSClientChangesGetInfoDataProp;
  group: BCMSClientChangesGetInfoDataProp;
  color: BCMSClientChangesGetInfoDataProp;
  language: BCMSClientChangesGetInfoDataProp;
  media: BCMSClientChangesGetInfoDataProp;
  status: BCMSClientChangesGetInfoDataProp;
  tag: BCMSClientChangesGetInfoDataProp;
  templates: BCMSClientChangesGetInfoDataProp;
  widget: BCMSClientChangesGetInfoDataProp;
}

/**
 * The BCMS changes API handler.
 */
export interface BCMSClientChangesHandler {
  /**
   * Get changes object.
   */
  getInfo(): Promise<BCMSClientChangesGetInfoData>;
}
