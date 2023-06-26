import type { AxiosError, AxiosRequestConfig } from 'axios';
import type {
  BCMSClientEntryHandler,
  BCMSClientFunctionHandler,
  BCMSClientTypeConverterHandler,
  BCMSClientMediaHandler,
  BCMSClientSocketHandler,
  BCMSClientTemplateHandler,
  BCMSClientChangesHandler,
  BCMSClientCacheManager,
} from './handlers';
import type { BCMSApiKeyAccess } from './models';

export interface BCMSClient {
  /**
   * Returns an Key Access object with permissions
   * and access rights.
   */
  getKeyAccess(): Promise<BCMSApiKeyAccess>;
  /**
   * Generic function for sending an authorized request
   * to the BCMS.
   */
  send: SendFunction;
  /**
   * Access the BCMS functions API.
   */
  function: BCMSClientFunctionHandler;
  /**
   * Access the BCMS entries API.
   */
  entry: BCMSClientEntryHandler;
  /**
   * Access to the BCMS type converter API.
   */
  typeConverter: BCMSClientTypeConverterHandler;
  /**
   * Access to the BCMS media API.
   */
  media: BCMSClientMediaHandler;
  /**
   * Access to the BCMS socket.
   */
  socket: BCMSClientSocketHandler;
  /**
   * Access to the BCMS templates API.
   */
  template: BCMSClientTemplateHandler;
  /**
   * Access to the BCMS changes API.
   */
  changes: BCMSClientChangesHandler;
  /**
   * Event though it is exposed, you should not
   * use cache manager directly.
   */
  cacheManager: BCMSClientCacheManager;
}

export interface SendFunction {
  <ResultBody = unknown, ErrorResult = unknown>(
    config: AxiosRequestConfig & {
      onError?(error: AxiosError): Promise<ErrorResult>;
      doNotUseAuth?: boolean;
      query?: {
        [name: string]: string;
      };
    },
  ): Promise<ResultBody>;
}

export interface GetKeyAccess {
  (): Promise<BCMSApiKeyAccess>;
}
