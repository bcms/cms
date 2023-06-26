import type {
  BCMSClientCache,
  BCMSClientCacheItem,
  BCMSClientCacheManager,
} from '../types';

export function createBcmsClientCache<
  Item extends BCMSClientCacheItem,
>(): BCMSClientCache<Item> {
  const state: {
    [id: string]: Item;
  } = {};
  return {
    all: false,
    find(query) {
      const output: Item[] = [];
      const ids = Object.keys(state);
      const items = ids.map((e) => state[e]);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (query(item, items)) {
          output.push(item);
        }
      }
      return output;
    },
    findOne(query) {
      const ids = Object.keys(state);
      const items = ids.map((e) => state[e]);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (query(item, items)) {
          return item;
        }
      }
      return null;
    },
    items() {
      return Object.keys(state).map((e) => state[e]);
    },
    remove(_items) {
      const items = _items instanceof Array ? _items : [_items];
      if (typeof items[0] !== 'string') {
        items.forEach((e) => (e as BCMSClientCacheItem)._id);
      }
      const cache = Object.keys(state).map((e) => state[e]);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        for (let j = 0; j < cache.length; j++) {
          const cacheItem = cache[j];
          if (item === cacheItem._id) {
            delete state[item];
            break;
          }
        }
      }
    },
    set(_items) {
      const items = _items instanceof Array ? _items : [_items];
      const cache = Object.keys(state).map((e) => state[e]);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        let found = false;
        for (let j = 0; j < cache.length; j++) {
          const cacheItem = cache[j];
          if (item._id === cacheItem._id) {
            state[item._id] = item;
            found = true;
            break;
          }
        }
        if (!found) {
          state[item._id] = item;
        }
      }
    },
  };
}

export function createBcmsClientCacheManager(): BCMSClientCacheManager {
  return {
    entry: createBcmsClientCache(),
    template: createBcmsClientCache(),
    entryParsed: createBcmsClientCache(),
    media: createBcmsClientCache(),
  };
}
