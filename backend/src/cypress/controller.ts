import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';

export const BCMSCypressController = createController({
  name: 'Cypress controller',
  path: '/api/cy',
  methods() {
    return {
      reset: createControllerMethod({
        path: '/reset',
        type: 'post',
        async handler() {
          // TODO: create database
        },
      }),
    };
  },
});
