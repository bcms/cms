import { BCMSRepo } from '@backend/repo';
import type { BCMSRouteProtectionJwtApiResult } from '@backend/types';
import { BCMSRouteProtection } from '@backend/util';
import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';

interface GetInfoDataProp {
  count: number;
  lastChangeAt: number;
}

interface GetInfoData {
  entry: GetInfoDataProp;
  group: GetInfoDataProp;
  color: GetInfoDataProp;
  language: GetInfoDataProp;
  media: GetInfoDataProp;
  status: GetInfoDataProp;
  tag: GetInfoDataProp;
  templates: GetInfoDataProp;
  widget: GetInfoDataProp;
}

export const BCMSChangeController = createController({
  name: 'Change Controller',
  path: '/api/changes',

  methods() {
    return {
      getInfo: createControllerMethod<
        BCMSRouteProtectionJwtApiResult,
        GetInfoData
      >({
        path: '/info',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler() {
          const changes = await BCMSRepo.change.findAll();
          const output: GetInfoData = {
            color: {
              count: 0,
              lastChangeAt: 0,
            },
            entry: {
              count: 0,
              lastChangeAt: 0,
            },
            group: {
              count: 0,
              lastChangeAt: 0,
            },
            language: {
              count: 0,
              lastChangeAt: 0,
            },
            media: {
              count: 0,
              lastChangeAt: 0,
            },
            status: {
              count: 0,
              lastChangeAt: 0,
            },
            tag: {
              count: 0,
              lastChangeAt: 0,
            },
            templates: {
              count: 0,
              lastChangeAt: 0,
            },
            widget: {
              count: 0,
              lastChangeAt: 0,
            },
          };
          for (let i = 0; i < changes.length; i++) {
            const change = changes[i];
            output[change.name] = {
              count: change.count,
              lastChangeAt: change.updatedAt,
            };
          }
          return output;
        },
      }),
    };
  },
});
