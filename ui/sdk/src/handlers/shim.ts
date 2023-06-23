import type { BCMSShimHandler, BCMSShimHandlerConfig } from '../types';

export function createBcmsShimHandler({
  send,
  storage,
}: BCMSShimHandlerConfig): BCMSShimHandler {
  const baseUri = '/shim';
  return {
    verify: {
      async otp(otp, user) {
        const result: {
          accessToken: string;
          refreshToken: string;
        } = await send({
          url: `${baseUri}/user/verify/otp${user ? '?user=true' : ''}`,
          method: 'POST',
          data: {
            otp,
          },
        });
        await storage.set('rt', result.refreshToken);
        await storage.set('at', result.accessToken);
      },
    },
  };
}
