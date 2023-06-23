import {
  BCMSSocketEntrySyncManagerConnInfo,
  BCMSSocketEventName,
  BCMSSocketSyncChangeEvent,
  BCMSSocketSyncEvent,
  BCMSSocketTypeSyncMetaRequest,
  BCMSSocketTypeSyncMetaResponse,
  BCMSSocketTypeYRequest,
  BCMSSocketTypeYResponse,
  BCMSSocketUnsyncEvent,
} from '@backend/types';
import type {
  SocketConnection,
  SocketEventHandler,
} from '@becomes/purple-cheetah-mod-socket/types';
import { BCMSSocketEntrySyncManager } from './entry-sync-manager';

interface Handler<Data = unknown, K = unknown>
  extends Omit<SocketEventHandler, 'name' | 'handler'> {
  name: BCMSSocketEventName;
  handler(data: Data, connection: SocketConnection<K>): Promise<void>;
}

export function bcmsCreateSocketEventHandlers(): Handler[] {
  function emit(
    conn: SocketConnection<unknown>,
    eventName: BCMSSocketEventName,
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
  ) {
    if (BCMSSocketEntrySyncManager.groups[path]) {
      for (const connId in BCMSSocketEntrySyncManager.groups[path]) {
        if (connId !== conn.id) {
          const info = BCMSSocketEntrySyncManager.groups[path][connId];
          info.conn.socket.emit(eventName, {
            ...data,
            connId: conn.id,
          });
        }
      }
    }
  }

  return [
    {
      name: BCMSSocketEventName.SYNC_CHANNEL,
      handler: async (data, conn) => {
        await BCMSSocketEntrySyncManager.triggerSub({
          connId: conn.id,
          channel: data.channel,
          payload: data.payload,
        });
      },
    } as Handler<{
      channel: string;
      payload: unknown;
    }>,
    {
      name: BCMSSocketEventName.SYNC_TSERV,
      handler: async (data, conn) => {
        BCMSSocketEntrySyncManager.sync(conn, data);
        emit(conn, BCMSSocketEventName.SYNC_FSERV, data.p, data);
      },
    } as Handler<BCMSSocketSyncEvent>,

    {
      name: BCMSSocketEventName.UNSYNC_TSERV,
      handler: async (data, conn) => {
        BCMSSocketEntrySyncManager.unsync(conn, data);
      },
    } as Handler<BCMSSocketUnsyncEvent>,

    {
      name: BCMSSocketEventName.SYNC_CHANGE_TSERV,
      handler: async (data, conn) => {
        emit(conn, BCMSSocketEventName.SYNC_CHANGE_FSERV, data.p, data);
        // if (BCMSSocketEntrySyncManager.groups[data.p]) {
        //   for (const connId in BCMSSocketEntrySyncManager.groups[data.p]) {
        //     if (connId !== conn.id) {
        //       const info = BCMSSocketEntrySyncManager.groups[data.p][connId];
        //       info.conn.socket.emit(BCMSSocketEventName.SYNC_CHANGE_FSERV, {
        //         ...data,
        //         connId: conn.id,
        //       });
        //     }
        //   }
        // }
      },
    } as Handler<BCMSSocketSyncChangeEvent>,
    {
      name: BCMSSocketEventName.Y_SYNC_REQ,
      handler: async (data, conn) => {
        const conns = BCMSSocketEntrySyncManager.groups[data.p];
        if (conns) {
          let oldestConn: BCMSSocketEntrySyncManagerConnInfo | undefined =
            undefined;
          for (const id in conns) {
            if (
              conns[id].conn.id !== conn.id &&
              (!oldestConn || oldestConn.age < conns[id].age)
            ) {
              oldestConn = conns[id];
            }
          }
          if (oldestConn) {
            oldestConn.conn.socket.emit(BCMSSocketEventName.Y_SYNC_REQ, {
              p: data.p,
              channel: data.channel,
              connId: conn.id,
            });
          }
        }
      },
    } as Handler<BCMSSocketTypeYRequest>,
    {
      name: BCMSSocketEventName.Y_SYNC_RES,
      handler: async (data) => {
        if (
          BCMSSocketEntrySyncManager.groups[data.p] &&
          BCMSSocketEntrySyncManager.groups[data.p][data.connId]
        ) {
          const conn = BCMSSocketEntrySyncManager.groups[data.p][data.connId];
          conn.conn.socket.emit(BCMSSocketEventName.Y_SYNC_RES, {
            p: data.p,
            channel: data.channel,
            data: data.data,
          });
        }
      },
    } as Handler<BCMSSocketTypeYResponse>,
    {
      name: BCMSSocketEventName.SYNC_META_REQ,
      handler: async (data, conn) => {
        const conns = BCMSSocketEntrySyncManager.groups[data.p];
        if (conns) {
          let oldestConn: BCMSSocketEntrySyncManagerConnInfo | undefined =
            undefined;
          for (const id in conns) {
            if (
              conns[id].conn.id !== conn.id &&
              (!oldestConn || oldestConn.age < conns[id].age)
            ) {
              oldestConn = conns[id];
            }
          }
          if (oldestConn) {
            oldestConn.conn.socket.emit(BCMSSocketEventName.SYNC_META_REQ, {
              p: data.p,
              connId: conn.id,
            });
          }
        }
      },
    } as Handler<BCMSSocketTypeSyncMetaRequest>,
    {
      name: BCMSSocketEventName.SYNC_META_RES,
      handler: async (data) => {
        if (
          BCMSSocketEntrySyncManager.groups[data.p] &&
          BCMSSocketEntrySyncManager.groups[data.p][data.connId]
        ) {
          const conn = BCMSSocketEntrySyncManager.groups[data.p][data.connId];
          conn.conn.socket.emit(BCMSSocketEventName.SYNC_META_RES, {
            p: data.p,
            data: data.data,
          });
        }
      },
    } as Handler<BCMSSocketTypeSyncMetaResponse>,
    {
      name: BCMSSocketEventName.SYNC_HEALTH,
      handler: async (data, conn) => {
        if (BCMSSocketEntrySyncManager.groups[data.p][conn.id]) {
          BCMSSocketEntrySyncManager.groups[data.p][conn.id].lastCheck =
            Date.now();
        }
      },
    } as Handler<any>,
  ];
}
