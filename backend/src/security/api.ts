import * as crypto from 'crypto';
import {
  ControllerMethodPreRequestHandler,
  HTTPStatus,
  Module,
} from '@becomes/purple-cheetah/types';
import type {
  BCMSApiKey,
  BCMSApiKeyRequestObject,
  BCMSApiKeySignature,
} from '../types';
import { BCMSRepo } from '@backend/repo';
import type { Request } from 'express';

const usedRequests: {
  [id: string]: {
    expAt: number;
  };
} = {};

export class BCMSApiKeySecurity {
  static async verify<Payload>(
    request: BCMSApiKeyRequestObject<Payload>,
    skipAccess?: boolean,
  ): Promise<BCMSApiKey> {
    request.path = request.path.split('?')[0];
    if (typeof request.data.k === 'undefined') {
      throw new Error(`Missing property 'key'.`);
    }
    if (typeof request.data.n === 'undefined') {
      throw new Error(`Missing property 'nonce'.`);
    }
    if (typeof request.data.t === 'undefined') {
      throw new Error(`Missing property 'timestamp'.`);
    } else {
      if (typeof request.data.t === 'string') {
        request.data.t = parseInt(request.data.t, 10);
        if (isNaN(request.data.t)) {
          throw new Error(`Missing property 'timestamp' of type number.`);
        }
      }
    }
    if (typeof request.data.s === 'undefined') {
      throw new Error(`Missing property 'signature'.`);
    }
    if (usedRequests[request.data.n + request.data.t]) {
      throw Error('This request was already used.');
    }
    const key = await BCMSRepo.apiKey.findById(request.data.k);
    if (!key) {
      throw new Error(`Invalid 'key' was provided.`);
    }
    if (key.blocked === true) {
      throw new Error('This Key is blocked.');
    }
    let payloadAsString = '';
    if (typeof request.payload === 'object') {
      payloadAsString = Buffer.from(
        encodeURIComponent(JSON.stringify(request.payload)),
      ).toString('base64');
    } else {
      payloadAsString = '' + request.payload;
    }
    if (
      request.data.t < Date.now() - 1800000 ||
      request.data.t > Date.now() + 3000
    ) {
      throw new Error('Timestamp out of range.');
    }
    const signature = crypto
      .createHmac('sha256', key.secret)
      .update(
        request.data.n + request.data.t + request.data.k + payloadAsString,
      )
      .digest('hex');
    if (signature !== request.data.s) {
      throw new Error('Invalid signature.');
    }
    if (skipAccess && skipAccess === true) {
      return key;
    }
    if (
      !BCMSApiKeySecurity.verifyAccess(key, request.requestMethod, request.path)
    ) {
      throw Error(
        'Key is not allowed to access ->' +
          ` ${request.requestMethod}: ${request.path}`,
      );
    }
    return JSON.parse(JSON.stringify(key));
  }

  static verifyAccess(key: BCMSApiKey, method: string, path: string): boolean {
    method = method.toLowerCase();
    if (
      path.startsWith('/api/key/access/list') ||
      path.startsWith('/api/type-converter') ||
      path.startsWith('/api/changes/info') ||
      path.startsWith('/api/template/all')
    ) {
      return true;
    } else if (path.startsWith('/api/media') && method === 'get') {
      return true;
    } else if (path.startsWith('/api/function')) {
      const p = path.replace('/api/function/', '').split('?')[0];
      if (key.access.functions.find((e) => e.name === p) && method === 'post') {
        return true;
      }
    } else if (path.startsWith('/api/template')) {
      const params = path.split('/').slice(3);
      switch (method) {
        case 'get': {
          // GET: /:templateId
          const templateId = params[0];
          const accessPolicy = key.access.templates.find(
            (e) => e._id === templateId || e.name === templateId,
          );
          if (accessPolicy) {
            return true;
          }
        }
      }
    } else if (path.startsWith('/api/entry')) {
      const parts = path.split('/');
      if (parts.length > 2) {
        const params = parts.slice(3);
        switch (method) {
          case 'get':
            {
              if (params.length > 1) {
                if (params[0] === 'all') {
                  // GET: /all/:templateId
                  // GET: /all/:templateId/lite
                  const templateId = params[1];
                  const accessPolicy = key.access.templates.find(
                    (e) => e._id === templateId || e.name === templateId,
                  );
                  if (accessPolicy && accessPolicy[method] === true) {
                    return true;
                  }
                } else if (params[0] === 'count') {
                  // GET: /count/:templateId
                  const templateId = params[1];
                  const accessPolicy = key.access.templates.find(
                    (e) => e._id === templateId || e.name === templateId,
                  );
                  if (accessPolicy && accessPolicy[method] === true) {
                    return true;
                  }
                } else {
                  // GET: /:templateId/:entryId
                  const templateId = params[0];
                  const accessPolicy = key.access.templates.find(
                    (e) => e._id === templateId || e.name === templateId,
                  );
                  if (accessPolicy && accessPolicy[method] === true) {
                    return true;
                  }
                }
              }
            }
            break;
          case 'post':
            {
              if (params.length === 1) {
                // POST: /:templateId/
                const templateId = params[0];
                const accessPolicy = key.access.templates.find(
                  (e) => e._id === templateId,
                );
                if (accessPolicy && accessPolicy[method] === true) {
                  return true;
                }
              }
            }
            break;
          case 'put':
            {
              if (params.length === 1) {
                // PUT: /:templateId/
                const templateId = params[0];
                const accessPolicy = key.access.templates.find(
                  (e) => e._id === templateId,
                );
                if (accessPolicy && accessPolicy[method] === true) {
                  return true;
                }
              }
            }
            break;
          case 'delete':
            {
              if (params.length === 2) {
                // POST: /:templateId/:entryId
                const templateId = params[0];
                const accessPolicy = key.access.templates.find(
                  (e) => e._id === templateId,
                );
                if (accessPolicy && accessPolicy[method] === true) {
                  return true;
                }
              }
            }
            break;
        }
      }
    } else if (path.startsWith('/api/plugin/')) {
      const p = path.replace('/api/plugin/', '').split('/');
      if (
        key.access.plugins &&
        key.access.plugins.find((e) => e.name === p[0])
      ) {
        return true;
      }
    }
    return false;
  }

  static sign(conf: {
    key: { id: string; secret: string };
    payload: unknown;
  }): BCMSApiKeySignature {
    const data: BCMSApiKeySignature = {
      k: conf.key.id,
      t: Date.now(),
      n: crypto.randomBytes(6).toString('hex'),
      s: '',
    };
    let payloadAsString = '';
    if (typeof conf.payload === 'object') {
      payloadAsString = Buffer.from(
        encodeURIComponent(JSON.stringify(conf.payload)),
      ).toString('base64');
    } else {
      payloadAsString = '' + conf.payload;
    }
    data.s = crypto
      .createHmac('sha256', conf.key.secret)
      .update(data.n + data.t + data.k + payloadAsString)
      .digest('hex');
    return data;
  }

  static httpRequestToApiKeyRequest<Payload>(
    request: Request,
  ): BCMSApiKeyRequestObject<Payload> {
    return {
      data: {
        k: request.query.key as string,
        n: request.query.nonce as string,
        s: request.query.signature as string,
        t: request.query.timestamp as string,
      },
      payload: request.body,
      requestMethod: request.method.toUpperCase(),
      path: request.originalUrl,
    };
  }
}

export function createBcmsApiKeySecurity(): Module {
  return {
    name: 'Api key security',
    initialize(moduleConfig) {
      function clearExpiredUsedRequests() {
        const ids = Object.keys(usedRequests);
        const date = Date.now();
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          if (usedRequests[id].expAt < date) {
            delete usedRequests[id];
          }
        }
      }

      setInterval(clearExpiredUsedRequests, 60);
      moduleConfig.next();
    },
  };
}

export function createBcmsApiKeySecurityPreRequestHandler(): ControllerMethodPreRequestHandler<{
  apiKey: BCMSApiKey;
}> {
  return async ({ request, errorHandler }) => {
    try {
      return {
        apiKey: await BCMSApiKeySecurity.verify(
          BCMSApiKeySecurity.httpRequestToApiKeyRequest(request),
        ),
      };
    } catch (err) {
      const error = err as Error;
      throw errorHandler.occurred(HTTPStatus.UNAUTHORIZED, error.message);
    }
  };
}
