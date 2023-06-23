import type {
  BCMSUser,
  BCMSUserHandler,
  BCMSUserHandlerConfig,
} from '../types';

export function createBcmsUserHandler({
  send,
  getAccessToken,
  cache,
  logout,
}: BCMSUserHandlerConfig): BCMSUserHandler {
  const baseUri = '/user';
  const getAllLatch = false;
  return {
    async getAll() {
      if (getAllLatch) {
        return cache.getters.items({ name: 'user' });
      }
      const result = await send<{ items: BCMSUser[] }>({
        url: `${baseUri}/all`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      cache.mutations.set({
        name: 'user',
        payload: result.items,
      });
      return result.items;
    },
    async get(id, skipCache) {
      if (!skipCache) {
        const accessToken = getAccessToken();
        if (!accessToken) {
          throw Error('You must be logged in.');
        }
        const targetId = id ? id : accessToken.payload.userId;
        const cacheHit = cache.getters.findOne<BCMSUser>({
          query: (e) => e._id === targetId,
          name: 'user',
        });
        if (cacheHit) {
          return cacheHit;
        }
      }
      const result: {
        item: BCMSUser;
      } = await send({
        url: `${baseUri}${id ? '/' + id : ''}`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      cache.mutations.set({ payload: result.item, name: 'user' });
      return result.item;
    },
    async update(data) {
      const result = await send<{ item: BCMSUser }>({
        url: `${baseUri}`,
        method: 'PUT',
        headers: {
          Authorization: '',
        },
        data,
      });
      cache.mutations.set({
        name: 'user',
        payload: result.item,
      });
      return result.item;
    },
    logout,
  };
}
