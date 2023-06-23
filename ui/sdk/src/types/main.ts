import type { AxiosRequestConfig } from 'axios';
import type { BCMSSdkCacheConfig, BCMSSdkCache } from './cache';
import type {
  BCMSApiKeyHandler,
  BCMSEntryHandler,
  BCMSFunctionHandler,
  BCMSGroupHandler,
  BCMSLanguageHandler,
  BCMSMediaHandler,
  BCMSShimHandler,
  BCMSSocketHandler,
  BCMSStatusHandler,
  BCMSTagHandler,
  BCMSTemplateHandler,
  BCMSTemplateOrganizerHandler,
  BCMSUserHandler,
  BCMSWidgetHandler,
  BCMSTypeConverterHandler,
  BCMSChangeHandler,
  BCMSSearchHandler,
  BCMSColorHandler,
  BCMSPluginHandler,
  BCMSBackupHandler,
  BCMSRouteTrackerHandler,
} from './handlers';
import type { BCMSJwt } from './models';
import type { BCMSStorage } from './storage';
import type { BCMSDateUtility, BCMSStringUtility, BCMSThrowable } from './util';

export interface BCMSSdkConfig {
  /**
   * Origin of the BCMS. For example: https://bcms.example.com
   */
  origin?: string;
  cache: BCMSSdkCacheConfig;
  useMemStorage?: boolean;
  useSocket?: boolean;
  sendFunction?: SendFunction;
  tokens?: {
    access: string;
    refresh: string;
  };
}

export interface BCMSSdk<CustomSocketEventsData = unknown> {
  send: SendFunction;
  storage: BCMSStorage;
  cache: BCMSSdkCache;
  isLoggedIn(): Promise<boolean>;
  getAccessToken(): BCMSJwt | null;

  // Handlers
  shim: BCMSShimHandler;
  user: BCMSUserHandler;
  apiKey: BCMSApiKeyHandler;
  function: BCMSFunctionHandler;
  language: BCMSLanguageHandler;
  status: BCMSStatusHandler;
  group: BCMSGroupHandler;
  widget: BCMSWidgetHandler;
  media: BCMSMediaHandler;
  templateOrganizer: BCMSTemplateOrganizerHandler;
  template: BCMSTemplateHandler;
  entry: BCMSEntryHandler;
  socket: BCMSSocketHandler<CustomSocketEventsData>;
  color: BCMSColorHandler;
  tag: BCMSTagHandler;
  typeConverter: BCMSTypeConverterHandler;
  change: BCMSChangeHandler;
  search: BCMSSearchHandler;
  plugin: BCMSPluginHandler;
  backup: BCMSBackupHandler;
  routeTracker: BCMSRouteTrackerHandler;
  util: {
    throwable: BCMSThrowable;
    string: BCMSStringUtility;
    date: BCMSDateUtility;
  };
}

export interface SendFunction {
  <Data>(config: AxiosRequestConfig & { doNotAuth?: boolean }): Promise<Data>;
}
