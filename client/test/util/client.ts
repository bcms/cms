import { BCMSClient } from '../../src';
import { Env } from './env';

export const client = BCMSClient({
  cmsOrigin: Env.cmsOrigin,
  key: Env.key,
});
