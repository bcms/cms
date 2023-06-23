import type { BCMSMedia } from "./models";

export interface BCMSImageProcessorProcessOptions {
  /**
   * How will image be centered if it is cropped.
   */
  position?: 'fill' | 'cover';
  /**
   * From 0 to 100.
   */
  quality?: number;
  /**
   * Specify size versions.
   */
  sizes?: {
    auto?: boolean;
    /**
     * Create versions with exec sizes.
     */
    exec?: Array<{
      width: number;
      height?: number;
    }>;
    /**
     * Define how many versions of the image to create.
     *
     * Example: If image is 1920x1080 and this option is set
     * to 3, 2 versions of the image will be created:
     * - 640x360
     * - 1280x720
     */
    steps?: number;
  };
}

export interface BCMSImageProcessorProcessConfig {
  input: string | BCMSMedia;
  inputBasePath: string;
  outputBasePath: string;
  options?: BCMSImageProcessorProcessOptions;
  optionsAsString?: string;
}