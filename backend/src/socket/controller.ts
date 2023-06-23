import { BCMSRepo } from '@backend/repo';
import { bcmsResCode } from '@backend/response-code';
import type { BCMSSocketEntrySyncManagerConnInfo } from '@backend/types';
import { BCMSRouteProtection } from '@backend/util';
import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus } from '@becomes/purple-cheetah/types';
import { BCMSSocketEntrySyncManager } from './entry-sync-manager';
import { BCMSSocketManager } from './manager';

export const BCMSSocketController = createController({
  name: 'SocketController',
  path: '/api/socket/sync',
  methods() {
    return {
      getConnsForPath: createControllerMethod<unknown, { items: string[] }>({
        path: '/connections',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          let pathQuery = '';
          try {
            pathQuery = Buffer.from(request.query.path + '', 'hex').toString();
          } catch (error) {
            const err = error as Error;
            errorHandler.occurred(HTTPStatus.BAD_REQUEST, err.message);
          }
          return {
            items: BCMSSocketEntrySyncManager.groups[pathQuery]
              ? Object.keys(BCMSSocketEntrySyncManager.groups[pathQuery])
              : [],
          };
        },
      }),
      entry: createControllerMethod<
        unknown,
        {
          sync: boolean;
          entry?: unknown;
        }
      >({
        path: '/entry/:tid/:eid',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          const tid = request.params.tid as string;
          const eid = request.params.eid as string;
          const template = await BCMSRepo.template.findById(tid);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tmp001', { id: tid }),
            );
          }
          const entry = await BCMSRepo.entry.findById(eid);
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('etr001', { id: eid }),
            );
          }
          let connInfo: BCMSSocketEntrySyncManagerConnInfo | null = null;
          const group =
            BCMSSocketEntrySyncManager.groups[
              `/dashboard/t/${template.cid}/e/${entry.cid}`
            ];
          if (!group) {
            return {
              sync: false,
            };
          }
          const connIds = Object.keys(group);
          if (connIds.length === 0) {
            return {
              sync: false,
            };
          }
          for (let i = 0; i < connIds.length; i++) {
            const connId = connIds[i];
            const item = group[connId];
            if (!connInfo || connInfo.age < item.age) {
              connInfo = item;
            }
          }
          if (!connInfo) {
            return {
              sync: false,
            };
          }
          const ci = connInfo;
          const result = await new Promise<{
            entry?: unknown;
          }>((resolve) => {
            const timeout = setTimeout(() => {
              resolve({});
              if (unsub) {
                unsub();
              }
            }, 10000);
            const { channel, unsub } = BCMSSocketEntrySyncManager.subscribe({
              connId: ci.conn.id,
              async handler(data: { entry: unknown }) {
                clearTimeout(timeout);
                resolve({
                  entry: data.entry,
                });
                unsub();
              },
            });
            BCMSSocketManager.emit.sync.entry({
              channel: channel,
              connId: ci.conn.id,
            });
          });
          if (!result.entry) {
            return { sync: false };
          }
          return {
            sync: true,
            entry: result.entry,
          };
        },
      }),
    };
  },
});
