import { expect } from 'chai';
import { createBcmsSdk } from '../../src';
import { store as Store } from '../../src/dev/store';
import type { BCMSTemplate } from '../../src/types';

const store = Store as any;

export const sdk = createBcmsSdk({
  origin: 'http://localhost:8080',
  cache: {
    custom: {
      getters: {
        find({ query, name }) {
          return store.getters[`${name}_find`](store.state)(query);
        },
        findOne({ query, name }) {
          return store.getters[`${name}_findOne`](store.state)(query);
        },
        items({ name }) {
          return store.getters[`${name}_items`](store.state);
        },
      },
      mutations: {
        remove({ payload, name }) {
          store.mutations[`${name}_remove`](store.state, payload);
        },
        set({ payload, name }) {
          store.mutations[`${name}_set`](store.state, payload);
        },
      },
    },
  },
});

export async function login(): Promise<void> {
  await sdk.shim.verify.otp('');
  const isLoggedIn = await sdk.isLoggedIn();
  expect(isLoggedIn).to.be.a('boolean').to.equal(true);
}

export function Login(): void {
  it('should login user "Dev User"', async () => {
    await login();
  });
}

export interface SetupTemplatesResult {
  templates: BCMSTemplate[];
  clear: () => Promise<void>;
}

export async function setupTemplates(): Promise<SetupTemplatesResult> {
  const templates: BCMSTemplate[] = [];
  templates.push(
    await sdk.template.create({
      label: 'Single entry template',
      desc: 'Template 1',
      singleEntry: true,
    }),
  );
  templates.push(
    await sdk.template.create({
      label: 'Multi entry template',
      desc: 'Template 2',
      singleEntry: false,
    }),
  );

  return {
    templates,
    clear: async () => {
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        await sdk.template.deleteById(template._id);
      }
    },
  };
}
