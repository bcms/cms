import {
  createBodyParserMiddleware,
  createCorsMiddleware,
  createPurpleCheetah,
  createRequestLoggerMiddleware,
} from '@becomes/purple-cheetah';
import type {
  Controller,
  Middleware,
  Module,
} from '@becomes/purple-cheetah/types';
import {
  JWTAlgorithm,
  JWTError,
  JWTPayload,
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { createJwt, useJwt } from '@becomes/purple-cheetah-mod-jwt';
import { createFSDB } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDB } from '@becomes/purple-cheetah-mod-mongodb';

import type { BCMSBackend, BCMSUserCustomPool } from './types';
import { BCMSConfig, loadBcmsConfig } from './config';
import { BCMSCypressController } from './cypress';
import {
  BCMSShimCallsController,
  BCMSShimUserController,
  createBcmsShimService,
  ShimConfig,
  BCMSShimConnectionAccess,
  BCMSShimSecurityMiddleware,
} from './shim';
import { BCMSUserController, createBcmsUserRepository } from './user';
import { BCMSApiKeySecurity, createBcmsApiKeySecurity } from './security';
import { BCMSApiKeyController, createBcmsApiKeyRepository } from './api';
import { BCMSFunctionController, createBcmsFunctionModule } from './function';
import { BCMSPluginController, createBcmsPluginModule } from './plugin';
import { createBcmsEventModule } from './event';
import { createBcmsJobModule } from './job';
import {
  BCMSLanguageController,
  createBcmsLanguageRepository,
} from './language';
import {
  BCMSMediaController,
  BCMSMediaMiddleware,
  createBcmsMediaRepository,
  createBcmsMediaService,
} from './media';
import { BCMSStatusController, createBcmsStatusRepository } from './status';
import {
  BCMSTemplateController,
  createBcmsTemplateRepository,
} from './template';
import { BCMSWidgetController, createBcmsWidgetRepository } from './widget';
import { createSocket } from '@becomes/purple-cheetah-mod-socket';
import { BCMSGroupController, createBcmsGroupRepository } from './group';
import { createBcmsPropHandler } from './prop';
import {
  createBcmsEntryParser,
  BCMSEntryController,
  createBcmsEntryRepository,
} from './entry';
import { createBcmsFfmpeg } from './util';
import {
  BCMSTemplateOrganizerController,
  createBcmsTemplateOrganizerRepository,
} from './template-organizer';
import {
  bcmsCreateSocketEventHandlers,
  BCMSSocketController,
  BCMSSocketEntrySyncManager,
  createBcmsSocketManager,
} from './socket';
import { BCMSUiAssetMiddleware } from './ui-middleware';
import { createBcmsIdCounterRepository } from './id-counter';
import { createBcmsFactories } from './factory';
import { BCMSAuthController } from './auth';
import { bcmsPostSetup, bcmsSetup } from './setup';
import { BCMSColorController, createBcmsColorRepository } from './color';
import { BCMSTagController, createBcmsTagRepository } from './tag';
import { BCMSTypeConverterController } from './type-converter';
import { BCMSSearchController } from './search';
import { BCMSChangeController, createBcmsChangeRepository } from './change';
import { loadBcmsResponseCodes } from './response-code';
import { BCMSBackupController, BCMSBackupMediaFileMiddleware } from './backup';
import { RouteTrackerController } from './route-tracker';
import type { SocketConnection } from '@becomes/purple-cheetah-mod-socket/types';
import { BCMSRouteTracker } from './route-tracker/service';

const backend: BCMSBackend = {
  app: undefined as never,
};

async function initialize() {
  await loadBcmsConfig();
  await loadBcmsResponseCodes();
  await createBcmsShimService();

  const modules: Module[] = [
    bcmsSetup(),
    createBcmsFactories(),
    createJwt({
      scopes: [
        {
          secret: BCMSConfig.jwt.secret,
          issuer: BCMSConfig.jwt.scope,
          alg: JWTAlgorithm.HMACSHA256,
          expIn: BCMSConfig.jwt.expireIn,
        },
      ],
    }),
    createSocket({
      path: '/api/socket/server',
      onConnection(socket) {
        let id: string;
        if (socket.handshake.query.at) {
          try {
            const token: JWTPayload<BCMSUserCustomPool> = JSON.parse(
              Buffer.from(
                (socket.handshake.query.at as string).split('.')[1],
                'base64',
              ).toString(),
            );
            id = token.userId;
          } catch (err) {
            id = 'none';
          }
        } else {
          id = socket.handshake.query.key as string;
        }
        const conn: SocketConnection<unknown> = {
          id: `${id}_${Buffer.from(socket.id).toString('hex')}`,
          createdAt: Date.now(),
          scope: socket.handshake.query.at ? 'global' : 'client',
          socket,
        };
        socket.on('disconnect', () => {
          BCMSSocketEntrySyncManager.unsync(conn);
          delete BCMSRouteTracker.connections[conn.id];
        });
        return conn;
      },
      async verifyConnection(socket) {
        const query = socket.handshake.query as {
          at: string;
          signature: string;
          key: string;
          nonce: string;
          timestamp: string;
        };
        if (query.signature) {
          try {
            const key = await BCMSApiKeySecurity.verify(
              {
                path: '',
                requestMethod: 'POST',
                data: {
                  k: query.key,
                  n: query.nonce,
                  t: query.timestamp,
                  s: query.signature,
                },
                payload: {},
              },
              true,
            );
            if (!key) {
              return false;
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            return false;
          }
        } else {
          const jwt = useJwt();
          const token = jwt.get({
            jwtString: query.at,
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.READ,
          });
          if (token instanceof JWTError) {
            return false;
          }
        }
        return true;
      },
      eventHandlers: bcmsCreateSocketEventHandlers(),
      // eventHandlers: [createEntryChangeSocketHandler()],
    }),
    createBcmsSocketManager(),
    createBcmsMediaService(),
    createBcmsFfmpeg(),
    // Repos
    createBcmsApiKeyRepository(),
    createBcmsEntryRepository(),
    createBcmsGroupRepository(),
    createBcmsIdCounterRepository(),
    createBcmsLanguageRepository(),
    createBcmsMediaRepository(),
    createBcmsStatusRepository(),
    createBcmsTemplateRepository(),
    createBcmsTemplateOrganizerRepository(),
    createBcmsUserRepository(),
    createBcmsWidgetRepository(),
    createBcmsColorRepository(),
    createBcmsTagRepository(),
    createBcmsChangeRepository(),
  ];
  const middleware: Middleware[] = [
    createCorsMiddleware(),
    createBodyParserMiddleware({
      limit: BCMSConfig.bodySizeLimit ? BCMSConfig.bodySizeLimit : 1024000000,
    }),
    BCMSShimSecurityMiddleware,
    BCMSShimConnectionAccess,
    BCMSMediaMiddleware,
    BCMSUiAssetMiddleware,
    BCMSBackupMediaFileMiddleware,
  ];
  const controllers: Controller[] = [
    BCMSAuthController,
    BCMSUserController,
    BCMSShimCallsController,
    BCMSShimUserController,
    BCMSApiKeyController,
    BCMSPluginController,
    BCMSLanguageController,
    BCMSGroupController,
    BCMSMediaController,
    BCMSStatusController,
    BCMSFunctionController,
    BCMSTemplateController,
    BCMSWidgetController,
    BCMSEntryController,
    BCMSTemplateOrganizerController,
    BCMSColorController,
    BCMSTagController,
    BCMSTypeConverterController,
    BCMSChangeController,
    BCMSSearchController,
    BCMSBackupController,
    RouteTrackerController,
    BCMSSocketController,
  ];
  if (BCMSConfig.database.mongodb) {
    if (BCMSConfig.database.mongodb.selfHosted) {
      modules.push(
        createMongoDB({
          selfHosted: {
            db: {
              port: BCMSConfig.database.mongodb.selfHosted.port,
              host: BCMSConfig.database.mongodb.selfHosted.host,
              name: BCMSConfig.database.mongodb.selfHosted.name,
            },
            user: {
              name: BCMSConfig.database.mongodb.selfHosted.user,
              password: BCMSConfig.database.mongodb.selfHosted.password,
            },
          },
        }),
      );
    } else if (BCMSConfig.database.mongodb.atlas) {
      modules.push(
        createMongoDB({
          atlas: {
            db: {
              name: BCMSConfig.database.mongodb.atlas.name,
              readWrite: true,
              cluster: BCMSConfig.database.mongodb.atlas.cluster,
            },
            user: {
              name: BCMSConfig.database.mongodb.atlas.user,
              password: BCMSConfig.database.mongodb.atlas.password,
            },
          },
        }),
      );
    } else {
      throw Error('No MongoDB database configuration detected.');
    }
  } else if (BCMSConfig.database.fs) {
    modules.push(
      createFSDB({
        output: `db${BCMSConfig.database.prefix.startsWith('/') ? '' : '/'}${
          BCMSConfig.database.prefix
        }`,
        prettyOutput: true,
        saveInterval: 2000,
      }),
    );
  } else {
    throw Error('No database configuration detected.');
  }
  if (ShimConfig.local) {
    middleware.push(createRequestLoggerMiddleware());
    controllers.push(BCMSCypressController);
  }
  modules.push(createBcmsApiKeySecurity());
  modules.push(createBcmsPropHandler());
  modules.push(createBcmsEntryParser());
  modules.push(createBcmsPluginModule(BCMSConfig));
  modules.push(createBcmsFunctionModule());
  modules.push(createBcmsEventModule());
  modules.push(createBcmsJobModule());

  // modules.push(
  //   createGraphql({
  //     uri: '/api/gql',
  //     // TODO: Disable in production
  //     graphiql: true,
  //     rootName: 'BCMS',
  //     collections: [
  //       BCMSApiKeyCollection,
  //       BCMSPropCollection,
  //       BCMSGroupCollection,
  //       BCMSLanguageCollection,
  //       BCMSMediaCollection,
  //       BCMSColorCollection,
  //       BCMSStatusCollection,
  //       BCMSTagCollection,
  //       BCMSTemplateCollection,
  //       BCMSTemplateOrganizerCollection,
  //       BCMSWidgetCollection,
  //     ],
  //   }),
  // );

  modules.push(bcmsPostSetup());

  backend.app = createPurpleCheetah({
    port: BCMSConfig.port,
    middleware,
    controllers,
    modules,
    logger: {
      saveToFile: {
        interval: 2000,
        output: 'logs',
      },
    },
    onReady(pc) {
      const ex = pc.getExpress();
      ex.disable('x-powered-by');
    },
  });
}
initialize().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});

export function useBCMSBackend(): BCMSBackend {
  return backend;
}
