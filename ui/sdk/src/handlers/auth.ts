import type {
  BCMSAuthHandler,
  BCMSAuthHandlerConfig,
} from '@becomes/cms-sdk/types';

export function createBcmsAuthHandler({
  send,
  storage,
}: BCMSAuthHandlerConfig): BCMSAuthHandler {
  const baseUri = '/auth';

  return {
    async shouldSignUp() {
      const res = await send<{ yes: boolean }>({
        url: `${baseUri}/should-signup`,
      });
      return res.yes;
    },

    async signUpAdmin(data) {
      const res = await send<{ accessToken: string; refreshToken: string }>({
        url: `${baseUri}/signup-admin`,
        method: 'POST',
        data,
      });
      await storage.set('rt', res.refreshToken);
      await storage.set('at', res.accessToken);
    },

    async login(data) {
      const res = await send<{ accessToken: string; refreshToken: string }>({
        url: `${baseUri}/login`,
        method: 'POST',
        data,
      });
      await storage.set('rt', res.refreshToken);
      await storage.set('at', res.accessToken);
    },
  };
}
