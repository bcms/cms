import type { BCMSSdkCache } from '../cache';
import type { SendFunction } from '../main';
import type { BCMSSocketEvent, BCMSSocketEventName } from '../models';
import type { BCMSStorage } from '../storage';
import type { BCMSThrowable } from '../util';
import type { BCMSApiKeyHandler } from './api-key';
import type { BCMSColorHandler } from './color';
import type { BCMSEntryHandler } from './entry';
import type { BCMSGroupHandler } from './group';
import type { BCMSLanguageHandler } from './language';
import type { BCMSMediaHandler } from './media';
import type { BCMSStatusHandler } from './status';
import type { BCMSTagHandler } from './tag';
import type { BCMSTemplateHandler } from './template';
import type { BCMSTemplateOrganizerHandler } from './template-organizer';
import type { BCMSUserHandler } from './user';
import type { BCMSWidgetHandler } from './widget';

export interface BCMSSocketHandlerConfig {
  send: SendFunction;
  origin?: string;
  cache: BCMSSdkCache;
  storage: BCMSStorage;
  throwable: BCMSThrowable;
  refreshAccessToken(force?: boolean): Promise<void>;

  apiKeyHandler: BCMSApiKeyHandler;
  entryHandler: BCMSEntryHandler;
  groupHandler: BCMSGroupHandler;
  langHandler: BCMSLanguageHandler;
  mediaHandler: BCMSMediaHandler;
  statusHandler: BCMSStatusHandler;
  templateHandler: BCMSTemplateHandler;
  tempOrgHandler: BCMSTemplateOrganizerHandler;
  userHandler: BCMSUserHandler;
  widgetHandler: BCMSWidgetHandler;
  colorHandler: BCMSColorHandler;
  tagHandler: BCMSTagHandler;
}

export interface BCMSSocketHandler<CustomEventsData = unknown> {
  id(): string | null;
  connect(): Promise<void>;
  disconnect(): void;
  connected(): boolean;
  emit(event: string, data: unknown): void;
  subscribe(
    event: BCMSSocketEventName | string | 'ANY',
    callback: BCMSSocketSubscriptionCallback<CustomEventsData>,
  ): () => void;
  sync: {
    connections(path?: string): Promise<string[]>;
  };
}

export interface BCMSSocketSubscriptionCallback<CustomEventsData = unknown> {
  (event: BCMSSocketEvent | CustomEventsData): Promise<void>;
}
