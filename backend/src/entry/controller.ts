import { BCMSEventManager } from '@backend/event';
import { BCMSFactory } from '@backend/factory';
import { BCMSPropHandler } from '@backend/prop';
import { BCMSRepo } from '@backend/repo';
import { bcmsResCode } from '@backend/response-code';
import { BCMSRouteTracker } from '@backend/route-tracker';
import { BCMSSocketManager } from '@backend/socket';
import {
  createController,
  createControllerMethod,
  useObjectUtility,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import {
  HTTPStatus,
  ObjectUtility,
  ObjectUtilityError,
} from '@becomes/purple-cheetah/types';
import {
  BCMSEntryCreateData,
  BCMSEntryCreateDataSchema,
  BCMSEntryLite,
  BCMSEntryMeta,
  BCMSEntryParsed,
  BCMSEntryParser,
  BCMSEntryUpdateData,
  BCMSEntryUpdateDataSchema,
  BCMSEventConfigMethod,
  BCMSEventConfigScope,
  BCMSRouteProtectionJwtResult,
  BCMSSocketEventType,
  BCMSTemplate,
} from '../types';
import { BCMSRouteProtection } from '../util';
import { useBcmsEntryParser } from './parser';

interface Setup {
  entryParser: BCMSEntryParser;
  objectUtil: ObjectUtility;
}

export const BCMSEntryController = createController<Setup>({
  name: 'Entry controller',
  path: '/api/entry',
  setup() {
    return {
      entryParser: useBcmsEntryParser(),
      objectUtil: useObjectUtility(),
    };
  },
  methods({ entryParser, objectUtil }) {
    return {
      getManyLiteById: createControllerMethod({
        path: '/many/lite',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request }) {
          const ids = (request.headers['x-bcms-ids'] as string).split('-');
          return {
            items: await BCMSRepo.entry.findAllById(ids),
          };
        },
      }),

      getAllByTemplateId: createControllerMethod({
        path: '/all/:tid',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request }) {
          return {
            items: await BCMSRepo.entry.methods.findAllByTemplateId(
              request.params.tid,
            ),
          };
        },
      }),

      getAllByTemplateIdParsed: createControllerMethod({
        path: '/all/:tid/parse/:maxDepth',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request, errorHandler }) {
          const template = await BCMSRepo.template.methods.findByRef(
            request.params.tid,
          );
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tmp001', { id: request.params.tid }),
            );
          }
          const entries = await BCMSRepo.entry.methods.findAllByTemplateId(
            template._id,
          );
          const entriesParsed: BCMSEntryParsed[] = [];
          let maxDepth = 2;
          if (request.params.maxDepth) {
            const md = parseInt(request.params.maxDepth);
            if (!isNaN(md)) {
              if (md > 10) {
                maxDepth = 10;
              } else {
                maxDepth = md;
              }
            }
          }
          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const entryParsed = await entryParser.parse({
              programLng: request.query.pLang === 'rust' ? 'rust' : 'js',
              entry,
              maxDepth,
              depth: 0,
            });
            if (entryParsed) {
              entriesParsed.push(entryParsed);
            }
          }
          return {
            items: entriesParsed,
          };
        },
      }),

      getAllByTemplateIdLite: createControllerMethod({
        path: '/all/:tid/lite',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request }) {
          const entries = await BCMSRepo.entry.methods.findAllByTemplateId(
            request.params.tid,
          );
          const items: BCMSEntryLite[] = [];
          if (entries.length > 0) {
            const template = (await BCMSRepo.template.findById(
              entries[0].templateId,
            )) as BCMSTemplate;
            for (let i = 0; i < entries.length; i++) {
              const item = entries[i];
              items.push(BCMSFactory.entry.toLite(item, template));
            }
          }
          return {
            items,
          };
        },
      }),

      countByUserId: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { count: number }
      >({
        path: '/count/by-user',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ accessToken }) {
          return {
            count: await BCMSRepo.entry.methods.countByUserId(
              accessToken.payload.userId,
            ),
          };
        },
      }),

      countByTemplateId: createControllerMethod({
        path: '/count/:tid',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request }) {
          return {
            count: BCMSRepo.entry.methods.countByTemplateId(request.params.tid),
          };
        },
      }),

      whereIsItUsed: createControllerMethod<
        unknown,
        {
          entries: Array<{
            eid: string;
            tid: string;
          }>;
        }
      >({
        path: '/:tid/:eid/where-is-it-used',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          const tid = request.params.tid;
          const eid = request.params.eid;
          const entry = await BCMSRepo.entry.methods.findByTemplateIdAndId(
            tid,
            eid,
          );
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('etr001', { id: eid }),
            );
          }
          return {
            entries: await BCMSPropHandler.findEntryPointer({ entry }),
          };
        },
      }),

      getById: createControllerMethod({
        path: '/:tid/:eid',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request, errorHandler }) {
          const template = await BCMSRepo.template.methods.findByRef(
            request.params.tid,
          );
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tmp001', { id: request.params.tid }),
            );
          }
          const entry = await BCMSRepo.entry.methods.findByTemplateIdAndRef(
            template._id,
            request.params.eid,
          );
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('etr001', { id: request.params.eid }),
            );
          }
          return {
            item: entry,
          };
        },
      }),

      getByIdParsed: createControllerMethod({
        path: '/:tid/:eid/parse/:maxDepth',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request, errorHandler }) {
          const template = await BCMSRepo.template.methods.findByRef(
            request.params.tid,
          );
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tmp001', { id: request.params.tid }),
            );
          }
          const entry = await BCMSRepo.entry.methods.findByTemplateIdAndRef(
            template._id,
            request.params.eid,
          );
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('etr001', { id: request.params.eid }),
            );
          }
          let maxDepth = 2;
          if (request.params.maxDepth) {
            const md = parseInt(request.params.maxDepth);
            if (!isNaN(md)) {
              if (md > 10) {
                maxDepth = 10;
              } else {
                maxDepth = md;
              }
            }
          }
          return {
            item: await entryParser.parse({
              programLng: request.query.pLang === 'rust' ? 'rust' : 'js',
              entry,
              maxDepth,
              depth: 0,
            }),
          };
        },
      }),

      getByIdLite: createControllerMethod({
        path: '/:tid/:eid/lite',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request, errorHandler }) {
          const eid = request.params.eid;
          const entry = await BCMSRepo.entry.findById(eid);
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('etr001', { eid }),
            );
          }
          const item = BCMSFactory.entry.toLite(
            entry,
            (await BCMSRepo.template.findById(request.params.tid)) || undefined,
          );
          return {
            item,
          };
        },
      }),

      create: createControllerMethod({
        path: '/:tid',
        type: 'post',
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
        }),
        async handler({ request, errorHandler, token, key }) {
          const sid = request.headers['x-bcms-sid'] as string;
          const checkBody = objectUtil.compareWithSchema(
            request.body,
            BCMSEntryCreateDataSchema,
            'body',
          );
          if (checkBody instanceof ObjectUtilityError) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bcmsResCode('g002', {
                msg: checkBody.message,
              }),
            );
          }
          const body = request.body as BCMSEntryCreateData;
          const template = await BCMSRepo.template.findById(body.templateId);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tmp001', {
                id: body.templateId,
              }),
            );
          }

          const meta: BCMSEntryMeta[] = [];
          const langs = await BCMSRepo.language.findAll();
          const status = body.status
            ? await BCMSRepo.status.findById(body.status)
            : null;
          for (let i = 0; i < langs.length; i++) {
            const lang = langs[i];
            const langMeta = body.meta.find((e) => e.lng === lang.code);
            if (!langMeta) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('etr002', {
                  lng: lang.name,
                  prop: 'meta',
                }),
              );
            }
            const metaCheckResult = await BCMSPropHandler.checkPropValues({
              props: template.props,
              values: langMeta.props,
              level: `body.meta[${i}].props`,
            });
            if (metaCheckResult instanceof Error) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('etr003', {
                  error: metaCheckResult.message,
                  prop: 'meta',
                }),
              );
            }
            meta.push(langMeta);
          }
          let idc = await BCMSRepo.idc.methods.findAndIncByForId('entries');
          if (!idc) {
            const entryIdc = BCMSFactory.idc.create({
              count: 2,
              forId: 'entries',
              name: 'Entries',
            });
            const addIdcResult = await BCMSRepo.idc.add(entryIdc);
            if (!addIdcResult) {
              throw errorHandler.occurred(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Failed to add IDC to the database.',
              );
            }
            idc = 1;
          }
          body.content = await entryParser.injectPlaneText({
            content: body.content,
          });
          const entry = BCMSFactory.entry.create({
            cid: idc.toString(16),
            templateId: template._id,
            userId: token
              ? token.payload.userId
              : `key_${key ? key._id : 'unknown'}`,
            status: status ? status._id : undefined,
            meta: meta,
            content: body.content,
          });
          const addedEntry = await BCMSRepo.entry.add(entry);
          if (!addedEntry) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('etr004'),
            );
          }
          BCMSEventManager.emit(
            BCMSEventConfigScope.ENTRY,
            BCMSEventConfigMethod.ADD,
            entry,
          );
          await BCMSSocketManager.emit.entry({
            entryId: addedEntry._id,
            templateId: addedEntry.templateId,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: token
              ? [token.payload.userId + '_' + sid]
              : undefined,
          });
          await BCMSRepo.change.methods.updateAndIncByName('entry');
          return {
            item: addedEntry,
          };
        },
      }),

      update: createControllerMethod({
        path: '/:tid',
        type: 'put',
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
        }),
        async handler({ request, errorHandler, token }) {
          const checkBody = objectUtil.compareWithSchema(
            request.body,
            BCMSEntryUpdateDataSchema,
            'body',
          );
          if (checkBody instanceof ObjectUtilityError) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bcmsResCode('g002', {
                msg: checkBody.message,
              }),
            );
          }
          const body = request.body as BCMSEntryUpdateData;
          const template = await BCMSRepo.template.findById(body.templateId);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tmp001', {
                id: body.templateId,
              }),
            );
          }
          const entry = await BCMSRepo.entry.findById(body._id);
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('etr001', { id: request.params.eid }),
            );
          }
          const meta: BCMSEntryMeta[] = [];
          const langs = await BCMSRepo.language.findAll();
          const status = body.status
            ? await BCMSRepo.status.findById(body.status)
            : null;
          for (let i = 0; i < langs.length; i++) {
            const lang = langs[i];
            const langMeta = body.meta.find((e) => e.lng === lang.code);
            if (!langMeta) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('etr002', {
                  lng: lang.name,
                  prop: 'meta',
                }),
              );
            }
            const metaCheckResult = await BCMSPropHandler.checkPropValues({
              props: template.props,
              values: langMeta.props,
              level: `body.meta[${i}].props`,
            });
            if (metaCheckResult instanceof Error) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('etr003', {
                  error: metaCheckResult.message,
                  prop: 'meta',
                }),
              );
            }
            meta.push(langMeta);
          }
          entry.status = status ? status._id : '';
          entry.meta = meta;
          entry.content = await entryParser.injectPlaneText({
            content: body.content,
          });
          const updatedEntry = await BCMSRepo.entry.update(entry);
          if (!updatedEntry) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('etr004'),
            );
          }
          BCMSEventManager.emit(
            BCMSEventConfigScope.ENTRY,
            BCMSEventConfigMethod.UPDATE,
            entry,
          );
          const sid = request.headers['x-bcms-sid'] as string;
          await BCMSSocketManager.emit.entry({
            entryId: updatedEntry._id,
            templateId: updatedEntry.templateId,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: token
              ? [token.payload.userId + '_' + sid]
              : undefined,
          });
          const usersAtPath = BCMSRouteTracker.findByPath(
            `/dashboard/t/${template.cid}/e/${
              template.singleEntry ? 'single' : entry.cid
            }`,
          ).filter((e) => e.sid !== sid);
          BCMSSocketManager.emit.message({
            messageType: 'warn',
            message: 'm1',
            userIds: usersAtPath.map((e) => `${e.userId}_${e.sid}`),
          });
          await BCMSRepo.change.methods.updateAndIncByName('entry');
          return {
            item: updatedEntry,
          };
        },
      }),

      deleteById: createControllerMethod({
        path: '/:tid/:eid',
        type: 'delete',
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.DELETE,
        }),
        async handler({ request, errorHandler, token }) {
          const eid = request.params.eid;
          const entry = await BCMSRepo.entry.findById(eid);
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('etr001', { eid }),
            );
          }
          const deleteResult = await BCMSRepo.entry.deleteById(eid);
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('etr006'),
            );
          }
          BCMSEventManager.emit(
            BCMSEventConfigScope.ENTRY,
            BCMSEventConfigMethod.DELETE,
            entry,
          );
          const sid = request.headers['x-bcms-sid'] as string;
          await BCMSSocketManager.emit.entry({
            entryId: entry._id,
            templateId: entry.templateId,
            type: BCMSSocketEventType.REMOVE,
            userIds: 'all',
            excludeUserId: token
              ? [token.payload.userId + '_' + sid]
              : undefined,
          });
          await BCMSRepo.change.methods.updateAndIncByName('entry');
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
