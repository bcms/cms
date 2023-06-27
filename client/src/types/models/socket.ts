// eslint-disable-next-line no-shadow
export enum BCMSSocketEventName {
  API_KEY = 'API_KEY',
  ENTRY = 'ENTRY',
  GROUP = 'GROUP',
  LANGUAGE = 'LANGUAGE',
  MEDIA = 'MEDIA',
  STATUS = 'STATUS',
  TEMPLATE = 'TEMPLATE',
  TEMPLATE_ORGANIZER = 'TEMPLATE_ORGANIZER',
  USER = 'USER',
  WIDGET = 'WIDGET',
  COLOR = 'COLOR',
  TAG = 'TAG',
  CHANGE = 'CHANGE',
  REFRESH = 'REFRESH',
  SIGN_OUT = 'SIGN_OUT',
}

// eslint-disable-next-line no-shadow
export enum BCMSSocketEventType {
  UPDATE = 'UPDATE',
  REMOVE = 'REMOVE',
}

export interface BCMSSocketApiKeyEvent {
  /**
   * Api key ID.
   */
  a: string;
  /**
   * Event type.
   */
  t: BCMSSocketEventType;
}

export interface BCMSSocketEntryEvent {
  /**
   * Entry ID.
   */
  e: string;
  /**
   * Template ID, to which entry belong.
   */
  tm: string;
  /**
   * Event type.
   */
  t: BCMSSocketEventType;
}

export interface BCMSSocketGroupEvent {
  /**
   * Group ID.
   */
  g: string;
  /**
   * Event type.
   */
  t: BCMSSocketEventType;
}

export interface BCMSSocketLanguageEvent {
  /**
   * Language ID.
   */
  l: string;
  /**
   * Event type.
   */
  t: BCMSSocketEventType;
}

export interface BCMSSocketMediaEvent {
  /**
   * Media ID.
   */
  m: string;
  /**
   * Event type.
   */
  t: BCMSSocketEventType;
}

export interface BCMSSocketStatusEvent {
  /**
   * Status ID.
   */
  s: string;
  /**
   * Event type.
   */
  t: BCMSSocketEventType;
}

export interface BCMSSocketTemplateEvent {
  /**
   * Template ID.
   */
  tm: string;
  /**
   * Event type.
   */
  t: BCMSSocketEventType;
}

export interface BCMSSocketTemplateOrganizerEvent {
  /**
   * Template organizer ID.
   */
  to: string;
  /**
   * Event type.
   */
  t: BCMSSocketEventType;
}

export interface BCMSSocketUserEvent {
  /**
   * User ID.
   */
  u: string;
  /**
   * Event type.
   */
  t: BCMSSocketEventType;
}

export interface BCMSSocketWidgetEvent {
  /**
   * Widget ID.
   */
  w: string;
  /**
   * Event type.
   */
  t: BCMSSocketEventType;
}
export interface BCMSSocketColorEvent {
  /**
   * Color ID.
   */
  c: string;
  /**
   * Event type.
   */
  t: BCMSSocketEventType;
}
export interface BCMSSocketTagEvent {
  /**
   * Tag ID.
   */
  tg: string;
  /**
   * Event type.
   */
  t: BCMSSocketEventType;
}
export interface BCMSSocketRefreshEvent {
  /**
   * User ID.
   */
  u: string;
  /**
   * Event type.
   */
  t: BCMSSocketEventType;
}
export interface BCMSSocketSignOutEvent {
  /**
   * User ID.
   */
  u: string;
  /**
   * Event type.
   */
  t: BCMSSocketEventType;
}

export declare type BCMSSocketEvent =
  | BCMSSocketApiKeyEvent
  | BCMSSocketEntryEvent
  | BCMSSocketGroupEvent
  | BCMSSocketLanguageEvent
  | BCMSSocketMediaEvent
  | BCMSSocketStatusEvent
  | BCMSSocketTemplateEvent
  | BCMSSocketTemplateOrganizerEvent
  | BCMSSocketUserEvent
  | BCMSSocketWidgetEvent
  | BCMSSocketColorEvent
  | BCMSSocketTagEvent
  | BCMSSocketRefreshEvent
  | BCMSSocketSignOutEvent;
