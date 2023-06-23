import type {
  BCMSRouteTrackerHandler,
  BCMSRouteTrackerHandlerConfig,
  BCMSUser,
} from '../types';
import { Buffer } from 'buffer';

export function createBcmsRouteTrackerHandler({
  send,
  userHandler,
}: BCMSRouteTrackerHandlerConfig): BCMSRouteTrackerHandler {
  const baseUri = '/route-tracker';
  return {
    async register(path) {
      await send({
        url: baseUri + `/register?path=${Buffer.from(path).toString('hex')}`,
        method: 'POST',
        headers: {
          Authorization: '',
        },
      });
    },

    async getUserAtPath(path) {
      const result: {
        items: string[];
      } = await send({
        url: baseUri + `/get-users?path=${Buffer.from(path).toString('hex')}`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      const users: BCMSUser[] = [];
      for (let i = 0; i < result.items.length; i++) {
        const sid = result.items[i];
        const uid = sid.split('_')[0];
        const user = await userHandler.get(uid);
        users.push(user);
      }
      return users;
    },

    async getUsers() {
      const result: {
        items: Array<{ id: string; path: string }>;
      } = await send({
        url: baseUri + `/get-users`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      return result.items;
    },
  };
}
