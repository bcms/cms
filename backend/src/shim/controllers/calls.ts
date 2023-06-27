import { BCMSFactory } from '@backend/factory';
import { BCMSRepo } from '@backend/repo';
import { BCMSSocketManager } from '@backend/socket';
import { BCMSCloudUser, BCMSSocketEventType } from '@backend/types';
import {
  createController,
  createControllerMethod,
  ObjectUtility,
} from '@becomes/purple-cheetah';
import { HTTPStatus, ObjectUtilityError } from '@becomes/purple-cheetah/types';
import { BCMSShimService } from '../service';

export const BCMSShimCallsController = createController({
  name: 'Shim calls controller',
  path: '/api/shim/calls',
  methods() {
    return {
      health: createControllerMethod<unknown, { ok: boolean }>({
        path: '/health',
        type: 'post',
        async handler() {
          BCMSShimService.refreshAvailable();
          return {
            ok: true,
          };
        },
      }),

      userUpdate: createControllerMethod<void, { ok: boolean }>({
        path: '/user/update',
        type: 'post',
        async handler({ request, errorHandler }) {
          const body: {
            _id: string;
          } = request.body;
          const bodyCheck = ObjectUtility.compareWithSchema(
            body,
            {
              _id: {
                __type: 'string',
                __required: true,
              },
            },
            'body',
          );
          if (bodyCheck instanceof ObjectUtilityError) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bodyCheck.message,
            );
          }
          let cloudUser: BCMSCloudUser | null = null;
          try {
            cloudUser = (
              await BCMSShimService.send<
                {
                  user: BCMSCloudUser;
                },
                unknown
              >({
                uri: `/instance/user/${request.body._id}`,
                payload: {},
                errorHandler,
              })
            ).user;
          } catch (err) {
            cloudUser = null;
          }
          // Update user
          if (cloudUser) {
            const user = await BCMSRepo.user.findById(body._id);
            if (user) {
              await BCMSRepo.user.update(
                BCMSFactory.user.cloudUserToUser(
                  cloudUser,
                  user.customPool.policy,
                ),
              );
            } else {
              await BCMSRepo.user.add(
                BCMSFactory.user.cloudUserToUser(cloudUser),
              );
            }
            BCMSSocketManager.emit.user({
              type: BCMSSocketEventType.UPDATE,
              userId: cloudUser._id,
              userIds: 'all',
            });
          }
          // Remove user
          else {
            await BCMSRepo.user.deleteById(body._id);
            BCMSSocketManager.emit.user({
              type: BCMSSocketEventType.REMOVE,
              userId: body._id,
              userIds: 'all',
            });
            BCMSSocketManager.emit.signOut({
              userId: body._id,
            });
          }

          return {
            ok: true,
          };
        },
      }),
    };
  },
});
