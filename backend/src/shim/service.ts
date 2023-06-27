import * as crypto from 'crypto';
import {
  HTTPStatus,
  HTTPError,
  HttpClientResponseError,
  Logger,
  ObjectUtilityError,
  HttpClient,
} from '@becomes/purple-cheetah/types';
import {
  createHttpClient,
  useFS,
  useLogger,
  useObjectUtility,
} from '@becomes/purple-cheetah';
import { ShimConfig } from './config';
import { BCMSConfig } from '@backend/config';

let logger: Logger;
let http: HttpClient;
let connected = true;
let validTo = Date.now() + 10000;

export class BCMSShimService {
  static isConnected(): boolean {
    return connected;
  }

  static getCode(): string {
    return ShimConfig.code;
  }

  static refreshAvailable(): void {
    if (!connected) {
      connected = true;
      logger.info('refreshAvailable', 'Connected to the SHIM.');
    }
    validTo = Date.now() + 10000;
  }

  static async send<Return, Payload>(data: {
    uri: string;
    payload: Payload;
    errorHandler?: HTTPError;
  }): Promise<Return> {
    const nonce = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const response = await http.send<Return, Payload>({
      path: data.uri,
      method: 'post',
      data: data.payload,
      headers: {
        'bcms-iid': '' + ShimConfig.instanceId,
        'bcms-nc': nonce,
        'bcms-ts': '' + timestamp,
        'bcms-sig': crypto
          .createHmac('sha256', BCMSShimService.getCode())
          .update(nonce + timestamp + JSON.stringify(data.payload))
          .digest('hex'),
      },
    });
    if (response instanceof HttpClientResponseError) {
      // logger.error('send', response);
      if (data.errorHandler) {
        throw data.errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          'Failed to send a request.',
        );
      }
      throw Error('Failed to send a request.');
    }
    return response.data;
  }
}

export async function createBcmsShimService(): Promise<void> {
  logger = useLogger({ name: 'Shim service' });
  http = createHttpClient({
    name: 'shimClient',
    host: {
      name: BCMSConfig.local ? 'bcms-shim' : '172.17.0.1',
      port: BCMSConfig.local ? '1279' : '3000',
    },
    basePath: '/shim',
  });
  const fs = useFS();
  const file = await fs.read('shim.json');
  const objectUtil = useObjectUtility();
  const shimJson = JSON.parse(file.toString());
  const checkObject = objectUtil.compareWithSchema(
    shimJson,
    {
      code: {
        __type: 'string',
        __required: false,
      },
      instanceId: {
        __type: 'string',
        __required: false,
      },
      local: {
        __type: 'boolean',
        __required: false,
      },
    },
    'shim',
  );
  if (checkObject instanceof ObjectUtilityError) {
    throw Error(checkObject.message);
  }
  ShimConfig.code = shimJson.code || 'local';
  ShimConfig.instanceId = shimJson.instanceId || '';
  ShimConfig.local = shimJson.local || false;
  setInterval(() => {
    if (connected && validTo < Date.now()) {
      connected = false;
      logger.warn('', 'Lost connection to the SHIM.');
    }
  }, 1000);
}
