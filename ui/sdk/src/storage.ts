import { v4 as uuidv4 } from 'uuid';
import type {
  BCMSLocalStorageWrapper,
  BCMSStorage,
  BCMSStorageSubscriptionHandler,
} from './types';

export function createBcmsLocalStorageWrapper(
  useMemStorage?: boolean,
): BCMSLocalStorageWrapper {
  if (!useMemStorage && typeof localStorage !== 'undefined') {
    return {
      all() {
        return JSON.parse(JSON.stringify(localStorage));
      },
      getItem(key) {
        return localStorage.getItem(key);
      },
      setItem(key, value) {
        localStorage.setItem(key, value);
      },
      removeItem(key) {
        localStorage.removeItem(key);
      },
    };
  }

  const _storage: {
    [key: string]: string;
  } = {};

  return {
    all() {
      return JSON.parse(JSON.stringify(_storage));
    },
    getItem(key) {
      if (_storage[key]) {
        return '' + _storage[key];
      } else {
        return null;
      }
    },
    setItem(key, value) {
      _storage[key] = '' + value;
    },
    removeItem(key) {
      delete _storage[key];
    },
  };
}
export function createBcmsStorage(config: {
  prfx: string;
  useMemStorage?: boolean;
}): BCMSStorage {
  const ls = createBcmsLocalStorageWrapper(config.useMemStorage);
  const subs: {
    [id: string]: {
      key: string;
      handler: BCMSStorageSubscriptionHandler<unknown>;
    };
  } = {};
  const self: BCMSStorage = {
    async clear() {
      const items: { [key: string]: unknown } = ls.all();
      const keys = Object.keys(items);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key.startsWith(config.prfx)) {
          await self.remove(key.substring(config.prfx.length + 1));
        }
      }
    },
    async set(key, value) {
      try {
        if (typeof value === 'object') {
          ls.setItem(`${config.prfx}_${key}`, JSON.stringify(value));
        } else if (typeof value === 'string') {
          ls.setItem(`${config.prfx}_${key}`, value as string);
        } else {
          // eslint-disable-next-line no-console
          console.error(
            `Value can be only "string" or "object" but "${typeof value}" was provided.`,
          );
          return false;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return false;
      }
      const ids = Object.keys(subs);
      for (let i = 0; i < ids.length; i++) {
        const sub = subs[ids[i]];
        if (sub.key === key) {
          await sub.handler(JSON.parse(JSON.stringify(value)), 'set');
        }
      }
      return true;
    },
    async remove(key) {
      ls.removeItem(`${config.prfx}_${key}`);
      const ids = Object.keys(subs);
      for (let i = 0; i < ids.length; i++) {
        const sub = subs[ids[i]];
        if (sub.key === key) {
          await sub.handler(null, 'remove');
        }
      }
    },
    get(key) {
      const rawValue = ls.getItem(`${config.prfx}_${key}`);
      if (rawValue) {
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return rawValue;
        }
      }
      return undefined;
    },
    subscribe(key, handler) {
      const id = uuidv4();
      subs[id] = { key, handler: handler as never };
      return () => {
        delete subs[id];
      };
    },
  };
  return self;
}
