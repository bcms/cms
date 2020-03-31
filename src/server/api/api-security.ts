import * as crypto from 'crypto';
import { StringUtility } from 'purple-cheetah';
import { KeyCashService } from './key-cash.service';
import { Key } from './models/key.model';

/** Define properties of API Security Object. */
export interface APISecurityObject {
  /** Specific Key ID. */
  key: string;
  /** Time in milliseconds when object was created. */
  timestamp: number;
  /** User defined random string. 6 character string is recommended. */
  nonce: string;
  /** HMAC-SHA256 hash string used for verifying a request. */
  signature: string;
}

/**
 * Class that provides methods for creating and
 * verifying signature for API Requests.
 */
export class APISecurity {
  /** Method for creating request signature object. */
  public static sign(config: {
    key: {
      id: string;
      secret: string;
    };
    payload: any;
  }): APISecurityObject {
    const data: APISecurityObject = {
      key: config.key.id,
      timestamp: Date.now(),
      nonce: crypto
        .randomBytes(16)
        .toString('hex')
        .substring(0, 6),
      signature: '',
    };
    let payloadAsString: string = '';
    if (typeof config.payload === 'object') {
      payloadAsString = Buffer.from(JSON.stringify(config.payload)).toString(
        'base64',
      );
    } else {
      payloadAsString = '' + config.payload;
    }
    const hmac = crypto.createHmac('sha256', config.key.secret);
    hmac.update(data.nonce + data.timestamp + data.key + payloadAsString);
    data.signature = hmac.digest('hex');
    return data;
  }

  /** Method used for verifying a request signature object. */
  public static verify(
    data: APISecurityObject,
    payload: any,
    requestMethod: string,
    path: string,
    skipAccess?: boolean,
  ): void {
    path = path.split('?')[0];
    if (typeof data.key === 'undefined') {
      throw new Error(`Missing property 'key'.`);
    }
    if (typeof data.nonce === 'undefined') {
      throw new Error(`Missing property 'nonce'.`);
    }
    if (typeof data.timestamp === 'undefined') {
      throw new Error(`Missing property 'timestamp'.`);
    } else {
      if (typeof data.timestamp === 'string') {
        data.timestamp = parseInt(data.timestamp, 10);
      }
    }
    if (typeof data.signature === 'undefined') {
      throw new Error(`Missing property 'signature'.`);
    }
    if (StringUtility.isIdValid(data.key) === false) {
      throw new Error(`Invalid 'key' value was provided.`);
    }
    const key = KeyCashService.findById(data.key);
    if (key === null) {
      throw new Error(`Invalid 'key' was provided.`);
    }
    if (key.blocked === true) {
      throw new Error('This Key is blocked.');
    }
    let payloadAsString: string = '';
    if (typeof payload === 'object') {
      payloadAsString = Buffer.from(JSON.stringify(payload)).toString('base64');
    } else {
      payloadAsString = '' + payload;
    }
    if (
      data.timestamp < Date.now() - 60000 ||
      data.timestamp > Date.now() + 3000
    ) {
      throw new Error('Timestamp out of range.');
    }
    const hmac = crypto.createHmac('sha256', key.secret);
    hmac.update(data.nonce + data.timestamp + data.key + payloadAsString);
    const signature = hmac.digest('hex');
    if (signature !== data.signature) {
      throw new Error('Invalid signature.');
    }
    if (skipAccess && skipAccess === true) {
      return;
    }
    if (APISecurity.verifyAccess(key, requestMethod, path) === false) {
      throw new Error(`Key is not allowed to access this resource.`);
    }
  }

  public static verifyAccess(key: Key, method: string, path: string): boolean {
    if (path.startsWith('/function')) {
      const p = path.replace('/function/', '');
      if (key.access.functions.find(e => e.name === p) && method === 'POST') {
        return true;
      }
    } else if (path.startsWith('/template')) {
      const parts = path.split('/');
      if (parts.length > 1) {
        if (parts.length === 3) {
          if (parts[2] === 'all' && method === 'GET') {
            const templateAccess = key.access.templates.find(e =>
              e.methods.find(m => m === 'GET_ALL'),
            );
            if (templateAccess) {
              return true;
            }
          } else if (method === 'GET') {
            const templateAccess = key.access.templates.find(
              e => e._id === parts[2],
            );
            if (templateAccess) {
              if (templateAccess.methods.find(e => e === method)) {
                return true;
              }
            }
          }
        } else if (parts.length > 2 && parts[3] === 'entry') {
          const templateAccess = key.access.templates.find(
            e => e._id === parts[2],
          );
          if (templateAccess) {
            if (parts.length === 5 && parts[4] === 'all') {
              if (templateAccess.entry.methods.find(e => e === 'GET_ALL')) {
                return true;
              }
            } else {
              if (templateAccess.entry.methods.find(e => e === method)) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }
}
