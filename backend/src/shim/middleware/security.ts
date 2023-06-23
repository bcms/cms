import * as crypto from 'crypto';
import { createHTTPError, createMiddleware } from '@becomes/purple-cheetah';
import { HTTPStatus } from '@becomes/purple-cheetah/types';
import type { NextFunction, Request, Response } from 'express';
import { BCMSShimService } from '..';

export const BCMSShimSecurityMiddleware = createMiddleware({
  path: '/api/shim/calls',
  after: false,
  name: 'Shim instance security middleware',
  handler({ logger }) {
    const errorHandler = createHTTPError({
      logger,
      place: '',
    });
    const blockNonce: Array<{
      expAt: number;
      nonce: string;
      timestamp: number;
    }> = [];

    setInterval(() => {
      const remove: Array<{
        expAt: number;
        nonce: string;
        timestamp: number;
      }> = [];
      for (let i = 0; i < blockNonce.length; i++) {
        if (blockNonce[i].expAt < Date.now()) {
          remove.push(blockNonce[i]);
        }
      }
      for (let i = 0; i < remove.length; i++) {
        for (let j = 0; j < blockNonce.length; j++) {
          if (
            blockNonce[j].timestamp === remove[i].timestamp &&
            blockNonce[j].nonce === remove[i].nonce
          ) {
            blockNonce.splice(i, 1);
            break;
          }
        }
      }
    }, 1000);

    return async (req: Request, _res: Response, next: NextFunction) => {
      let nonce = '';
      let timestamp = 0;
      let sig = '';
      const instanceSecret = BCMSShimService.getCode();

      if (
        instanceSecret === 'local' ||
        req.originalUrl === '/api/shim/calls/health'
      ) {
        next();
        return;
      } else if (!instanceSecret) {
        next(
          errorHandler.occurred(
            HTTPStatus.FORBIDDEN,
            'Shim secret not available.',
          ),
        );
        return;
      }
      if (typeof req.headers['bcms-nc'] !== 'string') {
        next(errorHandler.occurred(HTTPStatus.BAD_REQUEST, 'Missing nonce.'));
        return;
      } else {
        nonce = req.headers['bcms-nc'];
      }
      if (typeof req.headers['bcms-ts'] !== 'string') {
        next(
          errorHandler.occurred(HTTPStatus.BAD_REQUEST, 'Missing timestamp.'),
        );
        return;
      } else {
        timestamp = parseInt(req.headers['bcms-ts']);
        if (
          isNaN(timestamp) ||
          timestamp < Date.now() - 60000 ||
          timestamp > Date.now() + 3000
        ) {
          next(
            errorHandler.occurred(HTTPStatus.BAD_REQUEST, 'Invalid timestamp.'),
          );
          return;
        }
      }
      if (typeof req.headers['bcms-sig'] !== 'string') {
        next(
          errorHandler.occurred(HTTPStatus.BAD_REQUEST, 'Missing signature.'),
        );
        return;
      } else {
        sig = req.headers['bcms-sig'];
      }
      if (
        blockNonce.find((e) => e.nonce === nonce && e.timestamp === timestamp)
      ) {
        next(errorHandler.occurred(HTTPStatus.FORBIDDEN, 'Blocked.'));
        return;
      }
      const checkSig = crypto
        .createHmac('sha256', instanceSecret)
        .update(nonce + timestamp + JSON.stringify(req.body))
        .digest('hex');
      if (checkSig !== sig) {
        next(
          errorHandler.occurred(HTTPStatus.UNAUTHORIZED, 'Invalid signature.'),
        );
        return;
      }
      next();
    };
  },
});
