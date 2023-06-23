import { createBcmsSdk } from '../main';
import { store } from './store';

(window as any).sdk = createBcmsSdk({
  origin: 'http://localhost:8080',
  cache: {
    custom: {
      getters: {
        find({ query, name }) {
          return store.getters[`${name}_find`](store.state)(
            query as any,
          ) as any[];
        },
        findOne({ query, name }) {
          return store.getters[`${name}_findOne`](store.state)(
            query as any,
          ) as any;
        },
        items({ name }) {
          return store.getters[`${name}_items`](store.state) as any[];
        },
      },
      mutations: {
        remove({ payload, name }) {
          store.mutations[`${name}_remove`](store.state, payload as any);
        },
        set({ payload, name }) {
          store.mutations[`${name}_set`](store.state, payload as any);
        },
      },
    },
  },
});
