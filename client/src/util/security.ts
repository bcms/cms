import { random as randomBytes } from 'crypto-js/lib-typedarrays';
import * as hmacSHA256 from 'crypto-js/hmac-sha256';
import type { BCMSApiKeySignature, BCMSClientSecurity } from '../types';
import { Buffer } from 'buffer';

export function createBcmsClientSecurity({
  apiKeyId,
  apiKeySecret,
}: {
  apiKeyId: string;
  apiKeySecret: string;
}): BCMSClientSecurity {
  return {
    sign(payload) {
      const data: BCMSApiKeySignature = {
        k: apiKeyId,
        t: Date.now(),
        n: randomBytes(3).toString(),
        s: '',
      };
      let payloadAsString: string;
      if (typeof payload === 'object') {
        payloadAsString = Buffer.from(
          encodeURIComponent(JSON.stringify(payload)),
        ).toString('base64');
      } else {
        payloadAsString = '' + payload;
      }
      data.s = hmacSHA256(
        data.n + data.t + data.k + payloadAsString,
        apiKeySecret,
      ).toString();
      return data;
    },
  };
}
