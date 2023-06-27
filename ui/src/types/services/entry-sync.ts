import type {
  BCMSSocketSyncChangeDataProp,
  BCMSSocketSyncChangeEvent,
  BCMSSocketSyncChangeStringDelta,
} from '@becomes/cms-sdk/types';
import type { BCMSArrayPropMoveEventData } from '../components';
import type { BCMSEntryExtended } from '../models';

export interface BCMSEntrySyncUserPointerElements {
  root: HTMLDivElement;
  cursor: HTMLDivElement;
  name: HTMLDivElement;
}

export interface BCMSEntrySyncFocusContainer {
  id: string;
  root: HTMLElement;
  focus: HTMLElement;
  bb: DOMRect;
  conns: {
    [connId: string]: boolean;
  };
  destroy(): void;
}

export interface BCMSEntrySyncUser {
  connId: string;
  uid: string;
  colors: {
    cursor: string;
    avatarRing: string;
  };
  name: string;
  avatar: string;
  avatarEl: HTMLElement;
  avatarMoveEl: HTMLElement;
  mouse: [number, number];
  _handlers: Array<(user: BCMSEntrySyncUser) => void>;
  pointerElements: BCMSEntrySyncUserPointerElements;
  focusElement?: HTMLElement;
  onUpdate(handler: (user: BCMSEntrySyncUser) => void): void;
  destroy(): void;
}

// TODO: Move to SDK
export type BCMSEntrySyncChannelType = 'entry-sync';

// TODO: Move to SDK
export interface BCMSEntrySyncChannelData {
  type: BCMSEntrySyncChannelType;
  channel: string;
}

export interface BCMSEntrySync {
  scroll: {
    y: {
      curr: number;
      last: number;
    };
  };
  mouse: {
    pos: {
      curr: [number, number];
      last: [number, number];
    };
    click: {
      left: boolean;
    };
  };
  users: { [id: string]: BCMSEntrySyncUser };
  sync(): Promise<void>;
  unsync(): Promise<void>;
  createUsers(): Promise<BCMSEntrySyncUser[]>;
  createUser(connId: string): Promise<BCMSEntrySyncUser>;
  createUserPointer(user: BCMSEntrySyncUser): BCMSEntrySyncUserPointerElements;
  onChange(handler: (data: BCMSSocketSyncChangeEvent) => void): () => void;
  updateEntry(
    entry: BCMSEntryExtended,
    data: BCMSSocketSyncChangeDataProp
  ): Promise<void>;
  emit: {
    propValueChange(data: {
      propPath: string;
      languageCode: string;
      languageIndex: number;
      sd?: BCMSSocketSyncChangeStringDelta[];
      replaceValue?: unknown;
    }): void;
    propAddArrayItem(data: {
      propPath: string;
      languageCode: string;
      languageIndex: number;
    }): void;
    propRemoveArrayItem(data: {
      propPath: string;
      languageCode: string;
      languageIndex: number;
    }): void;
    propMoveArrayItem(data: {
      propPath: string;
      languageCode: string;
      languageIndex: number;
      data: BCMSArrayPropMoveEventData;
    }): void;
    contentUpdate(data: {
      propPath: string;
      languageCode: string;
      languageIndex: number;
      data: {
        updates: number[];
      };
    }): void;
    cursorUpdate(data: {
      propPath: string;
      languageCode: string;
      languageIndex: number;
      data: unknown;
    }): void;
    focus(data: { propPath: string }): void;
  };
}
