import { useSocket } from '@becomes/purple-cheetah-mod-socket';
import type { Socket } from '@becomes/purple-cheetah-mod-socket/types';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSSocketApiKeyEvent,
  BCMSSocketBackupEvent,
  BCMSSocketColorEvent,
  BCMSSocketEntryEvent,
  BCMSSocketEventName,
  BCMSSocketEventType,
  BCMSSocketGroupEvent,
  BCMSSocketLanguageEvent,
  BCMSSocketManagerScope,
  BCMSSocketMediaEvent,
  BCMSSocketMessageEvent,
  BCMSSocketRefreshEvent,
  BCMSSocketSignOutEvent,
  BCMSSocketStatusEvent,
  BCMSSocketTagEvent,
  BCMSSocketTemplateEvent,
  BCMSSocketTemplateOrganizerEvent,
  BCMSSocketUserEvent,
  BCMSSocketWidgetEvent,
} from '../types';

let soc: Socket;

async function emit<Data>({
  socket,
  name,
  data,
  userIds,
  excludeUserId,
  scopes,
}: {
  socket: Socket;
  name: BCMSSocketEventName;
  data: Data;
  userIds: string[] | 'all';
  excludeUserId?: string[];
  scopes?: BCMSSocketManagerScope[];
}): Promise<void> {
  if (userIds === 'all') {
    let toScopes: BCMSSocketManagerScope[];
    if (scopes) {
      toScopes = scopes;
    } else {
      toScopes = ['global', 'client'];
    }
    const connections = socket.findConnections(() => true);
    if (excludeUserId && excludeUserId.length > 0) {
      for (let i = 0; i < connections.length; i++) {
        const connection = connections[i];
        if (!excludeUserId.includes(connection.id)) {
          socket.emit<Data>({
            eventName: name,
            eventData: data,
            connectionId: connection.id,
          });
        }
      }
    } else {
      for (let i = 0; i < toScopes.length; i++) {
        const scope = toScopes[i];
        socket.emitToScope<Data>({
          eventName: name,
          eventData: data,
          scope: scope,
        });
      }
    }
  } else {
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const connection = socket.findConnection(
        (e) => e.id === userId || e.id.startsWith(userId),
      );
      if (connection && (!excludeUserId || !excludeUserId.includes(userId))) {
        socket.emit<Data>({
          eventName: name,
          eventData: data,
          connectionId: connection.id,
        });
      }
    }
  }
}

export class BCMSSocketManager {
  static emit = {
    async backup(data: {
      type: BCMSSocketEventType;
      userIds: string[] | 'all';
      fileName: string;
      size: number;
    }): Promise<void> {
      await emit<BCMSSocketBackupEvent>({
        socket: soc,
        name: BCMSSocketEventName.BACKUP,
        data: {
          t: data.type,
          f: data.fileName,
          s: data.size,
        },
        userIds: data.userIds,
      });
    },

    async message(data: {
      userIds: string[] | 'all';
      message: string;
      messageType: 'info' | 'success' | 'error' | 'warn';
    }): Promise<void> {
      await emit<BCMSSocketMessageEvent>({
        socket: soc,
        name: BCMSSocketEventName.MESSAGE,
        data: {
          t: BCMSSocketEventType.UPDATE,
          mt: data.messageType,
          m: data.message,
        },
        userIds: data.userIds,
      });
    },

    async apiKey(data: {
      type: BCMSSocketEventType;
      apiKeyId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void> {
      await emit<BCMSSocketApiKeyEvent>({
        socket: soc,
        name: BCMSSocketEventName.API_KEY,
        data: {
          a: data.apiKeyId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
        excludeUserId: data.excludeUserId,
      });
    },

    async entry(data: {
      type: BCMSSocketEventType;
      templateId: string;
      entryId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void> {
      await emit<BCMSSocketEntryEvent>({
        socket: soc,
        name: BCMSSocketEventName.ENTRY,
        data: {
          e: data.entryId,
          tm: data.templateId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
        excludeUserId: data.excludeUserId,
      });
    },

    async group(data: {
      type: BCMSSocketEventType;
      groupId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void> {
      await emit<BCMSSocketGroupEvent>({
        socket: soc,
        name: BCMSSocketEventName.GROUP,
        data: {
          g: data.groupId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
        excludeUserId: data.excludeUserId,
      });
    },

    async language(data: {
      type: BCMSSocketEventType;
      languageId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void> {
      await emit<BCMSSocketLanguageEvent>({
        socket: soc,
        name: BCMSSocketEventName.LANGUAGE,
        data: {
          l: data.languageId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
        excludeUserId: data.excludeUserId,
      });
    },

    async media(data: {
      type: BCMSSocketEventType;
      mediaId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void> {
      await emit<BCMSSocketMediaEvent>({
        socket: soc,
        name: BCMSSocketEventName.MEDIA,
        data: {
          m: data.mediaId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
        excludeUserId: data.excludeUserId,
      });
    },

    async status(data: {
      type: BCMSSocketEventType;
      statusId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void> {
      await emit<BCMSSocketStatusEvent>({
        socket: soc,
        name: BCMSSocketEventName.STATUS,
        data: {
          s: data.statusId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
        excludeUserId: data.excludeUserId,
      });
    },

    async template(data: {
      type: BCMSSocketEventType;
      templateId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void> {
      await emit<BCMSSocketTemplateEvent>({
        socket: soc,
        name: BCMSSocketEventName.TEMPLATE,
        data: {
          tm: data.templateId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
        excludeUserId: data.excludeUserId,
      });
    },

    async templateOrganizer(data: {
      type: BCMSSocketEventType;
      templateOrganizerId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void> {
      await emit<BCMSSocketTemplateOrganizerEvent>({
        socket: soc,
        name: BCMSSocketEventName.TEMPLATE_ORGANIZER,
        data: {
          to: data.templateOrganizerId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
        excludeUserId: data.excludeUserId,
      });
    },

    async user(data: {
      type: BCMSSocketEventType;
      userId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void> {
      await emit<BCMSSocketUserEvent>({
        socket: soc,
        name: BCMSSocketEventName.USER,
        data: {
          u: data.userId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
        excludeUserId: data.excludeUserId,
      });
    },

    async widget(data: {
      type: BCMSSocketEventType;
      widgetId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void> {
      await emit<BCMSSocketWidgetEvent>({
        socket: soc,
        name: BCMSSocketEventName.WIDGET,
        data: {
          w: data.widgetId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
        excludeUserId: data.excludeUserId,
      });
    },

    async color(data: {
      type: BCMSSocketEventType;
      colorId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void> {
      await emit<BCMSSocketColorEvent>({
        socket: soc,
        name: BCMSSocketEventName.COLOR,
        data: {
          c: data.colorId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
        excludeUserId: data.excludeUserId,
      });
    },

    async tag(data: {
      type: BCMSSocketEventType;
      tagId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void> {
      await emit<BCMSSocketTagEvent>({
        socket: soc,
        name: BCMSSocketEventName.TAG,
        data: {
          tg: data.tagId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
        excludeUserId: data.excludeUserId,
      });
    },

    async refresh(data: { userId: string }): Promise<void> {
      await emit<BCMSSocketRefreshEvent>({
        socket: soc,
        name: BCMSSocketEventName.REFRESH,
        data: {
          t: BCMSSocketEventType.UPDATE,
          u: data.userId,
        },
        userIds: [data.userId],
      });
    },

    async signOut(data: { userId: string }): Promise<void> {
      await emit<BCMSSocketSignOutEvent>({
        socket: soc,
        name: BCMSSocketEventName.SIGN_OUT,
        data: {
          t: BCMSSocketEventType.REMOVE,
          u: data.userId,
        },
        userIds: [data.userId],
      });
    },

    sync: {
      async entry(data: { channel: string; connId: string }): Promise<void> {
        soc.emit({
          eventName: 'SC',
          eventData: {
            type: 'entry-sync',
            channel: data.channel,
          },
          connectionId: data.connId,
        });
      },
    },
  };
}

export function createBcmsSocketManager(): Module {
  return {
    name: 'Socket manager',
    initialize(moduleConfig) {
      soc = useSocket();
      moduleConfig.next();
    },
  };
}
