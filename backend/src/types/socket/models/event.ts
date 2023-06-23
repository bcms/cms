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
  BACKUP = 'BACKUP',
  MESSAGE = 'MESSAGE',
  SYNC_CHANNEL = 'SC',
  SYNC_TSERV = 'ST',
  UNSYNC_TSERV = 'UST',
  SYNC_CHANGE_TSERV = 'SCT',
  SYNC_FSERV = 'SF',
  UNSYNC_FSERV = 'USF',
  SYNC_CHANGE_FSERV = 'SCF',
  SYNC_META_REQ = 'SMQ',
  SYNC_META_RES = 'SMS',
  SYNC_HEALTH = 'SH',
  Y_SYNC_REQ = 'YSQ',
  Y_SYNC_RES = 'YSS',
}

// eslint-disable-next-line no-shadow
export enum BCMSSocketEventType {
  UPDATE = 'UPDATE',
  REMOVE = 'REMOVE',
}

// eslint-disable-next-line no-shadow
export enum BCMSSocketSyncChangeType {
  MOUSE = 'M',
  PROP = 'P',
}

export interface BCMSSocketSyncChangeDataMouse {
  x: number;
  y: number;
}

export interface BCMSSocketSyncChangeStringDelta {
  /**
   * Add [char_index, char_value].
   */
  a?: [number, string];
  /**
   * Remove char at index.
   */
  r?: number;
}

export interface BCMSSocketSyncChangeDataProp {
  /**
   * Prop index.
   */
  i: number;
  /**
   * Prop value index.
   */
  vi: number;
  /**
   * Prop ID.
   */
  id: string;
  /**
   * Language.
   */
  l: string;
  /**
   * Language index.
   */
  li: number;
  /**
   * String deltas.
   */
  sd?: BCMSSocketSyncChangeStringDelta[];
  /**
   * Replace value.
   */
  rep?: unknown;
  /**
   * Add item to an array.
   */
  addI?: boolean;
  /**
   * Remove item from an array.
   */
  remI?: boolean;
  /**
   * Move item in an array.
   */
  movI?: unknown;
}

export interface BCMSSocketMessageEvent {
  /**
   * Event type.
   */
  t: BCMSSocketEventType;
  /**
   * Type of the message.
   */
  mt: 'info' | 'error' | 'warn' | 'success';
  /**
   * Message content.
   */
  m: string;
}

export interface BCMSSocketBackupEvent {
  /**
   * File name.
   */
  f: string;
  /**
   * Size
   */
  s: number;
  /**
   * Event type.
   */
  t: BCMSSocketEventType;
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

export interface BCMSSocketSyncEvent {
  /**
   * URI path.
   */
  p: string;
  connId?: string;
}

export interface BCMSSocketUnsyncEvent {
  /**
   * URI path.
   */
  p: string;
  connId?: string;
}

export interface BCMSSocketSyncChangeEvent {
  /**
   * URI path.
   */
  p: string;
  /**
   * Sync change type.
   */
  sct: BCMSSocketSyncChangeType;
  data: BCMSSocketSyncChangeDataMouse | BCMSSocketSyncChangeDataProp;
  connId?: string;
}

export interface BCMSSocketTypeYRequest {
  /**
   * URI path.
   */
  p: string;
  channel: string;
}

export interface BCMSSocketTypeYResponse {
  /**
   * URI path.
   */
  p: string;
  channel: string;
  connId: string;
  data: Buffer;
}

export interface BCMSSocketTypeSyncMetaRequest {
  /**
   * URI path.
   */
  p: string;
}

export interface BCMSSocketTypeSyncMetaResponse {
  /**
   * URI path.
   */
  p: string;
  connId: string;
  data: any;
}
