import { v4 as uuidv4 } from 'uuid';
import {
  BCMSSocketEntrySyncManagerConnInfo,
  BCMSSocketEventName,
  BCMSSocketSyncEvent,
  BCMSSocketUnsyncEvent,
} from '@backend/types';
import type { SocketConnection } from '@becomes/purple-cheetah-mod-socket/types';

interface Groups {
  [path: string]: {
    [connId: string]: BCMSSocketEntrySyncManagerConnInfo;
  };
}

export class BCMSSocketEntrySyncManager {
  private static subs: {
    [connId: string]: {
      [channel: string]: (data: unknown) => Promise<void>;
    };
  } = {};
  static groups: Groups = {};

  static sync(
    conn: SocketConnection<unknown>,
    data: BCMSSocketSyncEvent,
  ): void {
    if (!BCMSSocketEntrySyncManager.groups[data.p]) {
      BCMSSocketEntrySyncManager.groups[data.p] = {};
    }
    const uid = conn.id.split('_')[0];
    BCMSSocketEntrySyncManager.groups[data.p][conn.id] = {
      sid: conn.socket.id,
      age: Date.now(),
      uid,
      conn,
      lastCheck: Date.now(),
    };
  }

  static unsync(
    conn: SocketConnection<unknown>,
    data?: BCMSSocketUnsyncEvent,
  ): void {
    if (data) {
      if (
        BCMSSocketEntrySyncManager.groups[data.p] &&
        BCMSSocketEntrySyncManager.groups[data.p][conn.id]
      ) {
        for (const connId in BCMSSocketEntrySyncManager.groups[data.p]) {
          if (connId !== conn.id) {
            const info = BCMSSocketEntrySyncManager.groups[data.p][connId];
            info.conn.socket.emit(BCMSSocketEventName.UNSYNC_FSERV, {
              p: data.p,
              connId: conn.id,
            });
          }
        }
        delete BCMSSocketEntrySyncManager.groups[data.p][conn.id];
      }
    } else {
      for (const path in BCMSSocketEntrySyncManager.groups) {
        if (BCMSSocketEntrySyncManager.groups[path][conn.id]) {
          for (const connId in BCMSSocketEntrySyncManager.groups[path]) {
            if (connId !== conn.id) {
              const info = BCMSSocketEntrySyncManager.groups[path][connId];
              info.conn.socket.emit(BCMSSocketEventName.UNSYNC_FSERV, {
                p: path,
                connId: conn.id,
              });
            }
          }
          delete BCMSSocketEntrySyncManager.groups[path][conn.id];
        }
      }
    }
  }

  static subscribe<HandlerData = unknown>(data: {
    connId: string;
    handler: (eventData: HandlerData) => Promise<void>;
  }): { channel: string; unsub: () => void } {
    const channel = uuidv4();
    if (!this.subs[data.connId]) {
      this.subs[data.connId] = {};
    }
    this.subs[data.connId][channel] = data.handler as (
      eventData: unknown,
    ) => Promise<void>;
    return {
      channel,
      unsub: () => {
        delete this.subs[data.connId][channel];
      },
    };
  }

  static async triggerSub(data: {
    connId: string;
    channel: string;
    payload: unknown;
  }): Promise<void> {
    if (this.subs[data.connId][data.channel]) {
      await this.subs[data.connId][data.channel](data.payload);
    }
  }
}
