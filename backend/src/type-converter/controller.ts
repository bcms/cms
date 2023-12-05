import { BCMSRepo } from '@backend/repo';
import { bcmsResCode } from '@backend/response-code';
import type {
  BCMSGroup,
  BCMSTemplate,
  BCMSTypeConverterResultItem,
  BCMSTypeConverterTarget,
  BCMSWidget,
} from '@backend/types';
import { BCMSRouteProtection } from '@backend/util';
import { BCMSTypeConverter } from '@backend/util/type-converter';
import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus } from '@becomes/purple-cheetah/types';

export const BCMSTypeConverterController = createController({
  name: 'Type converter controller',
  path: '/api/type-converter',
  methods() {
    return {
      getAll: createControllerMethod<
        unknown,
        { items: BCMSTypeConverterResultItem[] }
      >({
        path: '/:languageType/all',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request, errorHandler }) {
          const templates = await BCMSRepo.template.findAll();
          const groups = await BCMSRepo.group.findAll();
          const widgets = await BCMSRepo.widget.findAll();
          if (
            request.params.languageType !== 'typescript' &&
            request.params.languageType !== 'jsDoc' &&
            request.params.languageType !== 'gql' &&
            request.params.languageType !== 'rust'
          ) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bcmsResCode('tc003', { type: request.params.type }),
            );
          }
          const converter: 'typescript' | 'jsDoc' | 'gql' | 'rust' =
            request.params.languageType === 'typescript'
              ? 'typescript'
              : request.params.languageType === 'gql'
              ? 'gql'
              : request.params.languageType === 'rust'
              ? 'rust'
              : 'jsDoc';

          return {
            items: await BCMSTypeConverter[converter]([
              ...templates.map((e) => {
                return {
                  name: e.name,
                  type: 'template',
                  props: e.props,
                } as BCMSTypeConverterTarget;
              }),
              ...templates.map((e) => {
                return {
                  name: e.name,
                  type: 'entry',
                  props: e.props,
                } as BCMSTypeConverterTarget;
              }),
              ...groups.map((e) => {
                return {
                  name: e.name,
                  type: 'group',
                  props: e.props,
                } as BCMSTypeConverterTarget;
              }),
              ...widgets.map((e) => {
                return {
                  name: e.name,
                  type: 'widget',
                  props: e.props,
                } as BCMSTypeConverterTarget;
              }),
            ]),
          };
        },
      }),
      get: createControllerMethod<
        unknown,
        { items: BCMSTypeConverterResultItem[] }
      >({
        path: '/:itemId/:itemType/:languageType',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request, errorHandler }) {
          if (
            request.params.languageType !== 'typescript' &&
            request.params.languageType !== 'JSDoc' &&
            request.params.languageType !== 'gql'
          ) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bcmsResCode('tc003', { type: request.params.type }),
            );
          }
          const allowedTypes = ['template', 'group', 'widget', 'entry'];
          if (!allowedTypes.includes(request.params.itemType)) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bcmsResCode('tc001', { itemType: request.params.itemType }),
            );
          }
          let item: BCMSGroup | BCMSTemplate | BCMSWidget | null = null;
          let itemType: BCMSTypeConverterTarget['type'] = 'entry';
          switch (request.params.itemType) {
            case 'entry':
              {
                item = await BCMSRepo.template.findById(request.params.itemId);
                itemType = 'entry';
              }
              break;
            case 'group':
              {
                item = await BCMSRepo.group.findById(request.params.itemId);
                itemType = 'group';
              }
              break;
            case 'widget':
              {
                item = await BCMSRepo.widget.findById(request.params.itemId);
                itemType = 'widget';
              }
              break;
            case 'template':
              {
                item = await BCMSRepo.template.findById(request.params.itemId);
                itemType = 'template';
              }
              break;
          }
          if (!item) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tc002', { itemId: request.params.itemId }),
            );
          }
          const converter: 'typescript' | 'jsDoc' | 'gql' =
            request.params.languageType === 'typescript'
              ? 'typescript'
              : request.params.languageType === 'gql'
              ? 'gql'
              : 'jsDoc';

          return {
            items: await BCMSTypeConverter[converter]([
              {
                name: item.name,
                type: itemType,
                props: item.props,
              },
            ]),
          };
        },
      }),
    };
  },
});
