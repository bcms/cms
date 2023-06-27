import * as path from 'path';
import {
  createController,
  createControllerMethod,
  createQueue,
  useFS,
} from '@becomes/purple-cheetah';
import { useJwt } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTError,
  JWTManager,
  JWTPermissionName,
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { FS, HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';
import {
  BCMSRouteProtectionJwtAndBodyCheckResult,
  BCMSMedia,
  BCMSMediaAddDirData,
  BCMSMediaAddDirDataSchema,
  BCMSMediaAggregate,
  BCMSMediaDuplicateData,
  BCMSMediaDuplicateDataSchema,
  BCMSMediaMoveData,
  BCMSMediaMoveDataSchema,
  BCMSMediaType,
  BCMSMediaUpdateData,
  BCMSMediaUpdateDataSchema,
  BCMSUserCustomPool,
} from '../types';
import { BCMSRouteProtection } from '../util';
import { BCMSRepo } from '@backend/repo';
import { bcmsResCode } from '@backend/response-code';
import { BCMSMediaService } from './service';
import { BCMSMediaRequestHandler } from './request-handler';
import { BCMSImageProcessor } from './image-processor';
import type { Request } from 'express';

interface Setup {
  jwt: JWTManager;
  fs: FS;
}
export const BCMSMediaController = createController<Setup>({
  name: 'Media controller',
  path: '/api/media',
  setup() {
    return {
      jwt: useJwt(),
      fs: useFS({
        base: process.cwd(),
      }),
    };
  },
  methods({ jwt, fs }) {
    const imageProcessQueue = createQueue();
    async function getBinFile(
      request: Request,
      errorHandler: HTTPError,
    ): Promise<{
      __file: string;
    }> {
      const apiKey = await BCMSRepo.apiKey.findById(request.params.keyId);
      if (!apiKey) {
        throw errorHandler.occurred(
          HTTPStatus.NOT_FOUNT,
          bcmsResCode('mda001', { id: request.params.id }),
        );
      }
      const media = await BCMSRepo.media.findById(request.params.id);
      if (!media) {
        throw errorHandler.occurred(
          HTTPStatus.NOT_FOUNT,
          bcmsResCode('mda001', { id: request.params.id }),
        );
      }
      if (media.type === BCMSMediaType.DIR) {
        throw errorHandler.occurred(
          HTTPStatus.FORBIDDEN,
          bcmsResCode('mda007', { id: request.params.id }),
        );
      }
      const queryParts = Buffer.from(request.params.fileOptions, 'hex')
        .toString()
        .split('&');
      const query: {
        [name: string]: string;
      } = {};
      for (let i = 0; i < queryParts.length; i++) {
        const part = queryParts[i];
        const keyValue = part.split('=');
        if (keyValue.length === 2) {
          query[keyValue[0]] = keyValue[1];
        }
      }

      if (
        query.ops &&
        (media.mimetype === 'image/jpeg' ||
          media.mimetype === 'image/jpg' ||
          media.mimetype === 'image/png')
      ) {
        let idx = parseInt(query.idx as string, 10);
        if (isNaN(idx) || idx < 0) {
          idx = 0;
        }
        const filePath = path.join(
          process.cwd(),
          'uploads',
          media._id,
          query.ops,
          media.name,
        );
        const filePathParts = filePath.split('.');
        const firstPart = filePathParts
          .slice(0, filePathParts.length - 1)
          .join('.');
        const lastPart = filePathParts[filePathParts.length - 1];
        const outputFilePath = `${firstPart}_${idx}.${
          query.webp ? 'webp' : lastPart
        }`;
        if (!(await fs.exist(outputFilePath, true))) {
          const options = BCMSImageProcessor.stringToOptions(query.ops + '');
          const mediaPath = path.join(
            process.cwd(),
            'uploads',
            await BCMSMediaService.getPath(media),
          );
          await imageProcessQueue({
            name: request.originalUrl,
            handler: async () => {
              await BCMSImageProcessor.process({
                media,
                pathToSrc: mediaPath,
                options,
              });
            },
          }).wait;
        }
        return {
          __file: outputFilePath,
        };
      }
      if (!(await BCMSMediaService.storage.exist(media))) {
        throw errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          bcmsResCode('mda008', { id: request.params.id }),
        );
      }
      return {
        __file: await BCMSMediaService.storage.getPath({ media }),
      };
    }

    return {
      getAll: createControllerMethod<unknown, { items: BCMSMedia[] }>({
        path: '/all',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler() {
          return {
            items: await BCMSMediaRequestHandler.getAll(),
          };
        },
      }),

      getAllAggregated: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSMediaAggregate[] }
      >({
        path: '/all/aggregate',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSMediaRequestHandler.getAllAggregated(),
          };
        },
      }),

      getAllByParentId: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSMedia[] }
      >({
        path: '/all/parent/:id',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          return {
            items: await BCMSMediaRequestHandler.getAllByParentId({
              id: request.params.id,
              errorHandler,
            }),
          };
        },
      }),

      getMany: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSMedia[] }
      >({
        path: '/many',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request }) {
          const ids = (request.headers['x-bcms-ids'] as string).split('-');
          return {
            items: await BCMSMediaRequestHandler.getMany(ids),
          };
        },
      }),

      count: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { count: number }
      >({
        path: '/count',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            count: await BCMSMediaRequestHandler.count(),
          };
        },
      }),

      getById: createControllerMethod<unknown, { item: BCMSMedia }>({
        path: '/:id',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request, errorHandler }) {
          return {
            item: await BCMSMediaRequestHandler.getById({
              id: request.params.id,
              errorHandler,
            }),
          };
        },
      }),

      getByIdAggregated: createControllerMethod({
        path: '/:id/aggregate',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          return {
            item: await BCMSMediaRequestHandler.getByIdAggregated({
              id: request.params.id,
              errorHandler,
            }),
          };
        },
      }),

      getBinary: createControllerMethod<unknown, { __file: string }>({
        path: '/:id/bin',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request, errorHandler }) {
          const media = await BCMSRepo.media.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('mda001', { id: request.params.id }),
            );
          }
          if (media.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('mda007', { id: request.params.id }),
            );
          }
          if (!(await BCMSMediaService.storage.exist(media))) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda008', { id: request.params.id }),
            );
          }
          return {
            __file: await BCMSMediaService.storage.getPath({ media }),
          };
        },
      }),

      getBinaryByAccessToken: createControllerMethod<
        unknown,
        { __file: string }
      >({
        path: '/:id/bin/act',
        type: 'get',
        async handler({ request, errorHandler }) {
          const atCookie = request.headers.cookie
            ? request.headers.cookie
                .split('; ')
                .find((e) => e.startsWith('bcmsat')) + ''
            : '';
          const accessToken = jwt.get({
            jwtString: atCookie.split('=')[1] || '',
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.READ,
          });
          if (accessToken instanceof JWTError) {
            throw errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              bcmsResCode('mda012'),
            );
          }
          const media = await BCMSRepo.media.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('mda001', { id: request.params.id }),
            );
          }
          if (media.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('mda007', { id: request.params.id }),
            );
          }
          if (!(await BCMSMediaService.storage.exist(media))) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda008', { id: request.params.id }),
            );
          }
          return {
            __file: await BCMSMediaService.storage.getPath({ media }),
          };
        },
      }),

      getBinaryApiKeyV2: createControllerMethod<unknown, { __file: string }>({
        path: '/pip/:id/bin/:keyId/:fileOptions/:fileName',
        type: 'get',
        async handler({ request, errorHandler }) {
          return await getBinFile(request, errorHandler);
        },
      }),

      getBinaryApiKey: createControllerMethod<unknown, { __file: string }>({
        path: '/pip/:id/bin/:keyId/:fileOptions',
        type: 'get',
        async handler({ request, errorHandler }) {
          return getBinFile(request, errorHandler);
        },
      }),

      getBinaryForSize: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { __file: string }
      >({
        path: '/:id/bin/:size',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          const media = await BCMSRepo.media.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('mda001', { id: request.params.id }),
            );
          }
          if (media.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('mda007', { id: request.params.id }),
            );
          }
          if (!(await BCMSMediaService.storage.exist(media))) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda008', { id: request.params.id }),
            );
          }
          return {
            __file: await BCMSMediaService.storage.getPath({
              media,
              size: request.params.size === 'small' ? 'small' : undefined,
            }),
          };
        },
      }),

      getBinaryForSizeByAccessToken: createControllerMethod<
        unknown,
        { __file: string }
      >({
        path: '/:id/bin/:size/act',
        type: 'get',
        async handler({ request, errorHandler }) {
          const accessToken = jwt.get({
            jwtString: request.query.act + '',
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.READ,
          });
          if (accessToken instanceof JWTError) {
            throw errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              bcmsResCode('mda012'),
            );
          }
          const media = await BCMSRepo.media.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('mda001', { id: request.params.id }),
            );
          }
          if (media.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('mda007', { id: request.params.id }),
            );
          }
          if (!(await BCMSMediaService.storage.exist(media))) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda008', { id: request.params.id }),
            );
          }
          return {
            __file: await BCMSMediaService.storage.getPath({
              media,
              size: request.params.size === 'small' ? 'small' : undefined,
            }),
          };
        },
      }),

      getVideoThumbnail: createControllerMethod<unknown, { __file: string }>({
        path: '/:id/vid/bin/thumbnail',
        type: 'get',
        async handler({ request, errorHandler }) {
          const accessToken = jwt.get({
            jwtString: request.query.act + '',
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.READ,
          });
          if (accessToken instanceof JWTError) {
            throw errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              bcmsResCode('mda012'),
            );
          }
          const media = await BCMSRepo.media.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('mda001', { id: request.params.id }),
            );
          }
          if (media.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('mda007', { id: request.params.id }),
            );
          }
          if (!(await BCMSMediaService.storage.exist(media))) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda008', { id: request.params.id }),
            );
          }
          return {
            __file: await BCMSMediaService.storage.getPath({
              media,
              thumbnail: true,
            }),
          };
        },
      }),

      requestUploadToken: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { token: string }
      >({
        path: '/request-upload-token',
        type: 'post',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.WRITE,
        ),
        async handler({ accessToken }) {
          return BCMSMediaRequestHandler.requestUploadToken({ accessToken });
        },
      }),

      createFile: createControllerMethod<
        // JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        void,
        { item: BCMSMedia }
      >({
        path: '/file',
        type: 'post',
        // preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
        //   [JWTRoleName.ADMIN, JWTRoleName.USER],
        //   JWTPermissionName.WRITE,
        // ),
        async handler({ request, errorHandler, logger, name }) {
          return {
            item: await BCMSMediaRequestHandler.createFile({
              sid: request.headers['x-bcms-sid'] as string,
              uploadToken: request.headers['x-bcms-upload-token'] as string,
              errorHandler,
              logger,
              name,
              file: request.file,
              parentId: request.query.parentId as string,
            }),
          };
        },
      }),

      createDir: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSMediaAddDirData>,
        { item: BCMSMedia }
      >({
        path: '/dir',
        type: 'post',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSMediaAddDirDataSchema,
          }),
        async handler({ body, errorHandler, accessToken, request }) {
          return {
            item: await BCMSMediaRequestHandler.createDir({
              sid: request.headers['x-bcms-sid'] as string,
              accessToken,
              errorHandler,
              body,
            }),
          };
        },
      }),

      updateFile: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSMediaUpdateData>,
        { item: BCMSMedia }
      >({
        path: '/file',
        type: 'put',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSMediaUpdateDataSchema,
          }),
        async handler({ errorHandler, body, accessToken, request }) {
          return {
            item: await BCMSMediaRequestHandler.update({
              sid: request.headers['x-bcms-sid'] as string,
              body,
              accessToken,
              errorHandler,
            }),
          };
        },
      }),

      duplicateFile: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSMediaDuplicateData>,
        { item: BCMSMedia }
      >({
        path: '/duplicate',
        type: 'post',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSMediaDuplicateDataSchema,
          }),
        async handler({ body, errorHandler, accessToken, request }) {
          return {
            item: await BCMSMediaRequestHandler.duplicateFile({
              sid: request.headers['x-bcms-sid'] as string,
              body,
              errorHandler,
              accessToken,
            }),
          };
        },
      }),

      moveFile: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSMediaMoveData>,
        { item: BCMSMedia }
      >({
        path: '/move',
        type: 'put',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSMediaMoveDataSchema,
          }),
        async handler({ body, errorHandler, accessToken, request }) {
          return {
            item: await BCMSMediaRequestHandler.moveFile({
              sid: request.headers['x-bcms-sid'] as string,
              body,
              errorHandler,
              accessToken,
            }),
          };
        },
      }),

      deleteById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { message: 'Success.' }
      >({
        path: '/:id',
        type: 'delete',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.DELETE,
        ),
        async handler({ request, errorHandler, accessToken, logger, name }) {
          await BCMSMediaRequestHandler.delete({
            sid: request.headers['x-bcms-sid'] as string,
            id: request.params.id,
            errorHandler,
            accessToken,
            logger,
            name,
          });
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
