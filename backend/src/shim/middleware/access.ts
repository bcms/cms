import { BCMSConfig } from '@backend/config';
import { createMiddleware } from '@becomes/purple-cheetah';
import type { NextFunction, Request, Response } from 'express';
import { BCMSShimService } from '..';

export const BCMSShimConnectionAccess = createMiddleware({
  name: 'Middleware to allow access only if shim is ok',
  after: false,
  path: '/api',
  handler() {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (
        req.originalUrl === '/api/shim/calls/health' ||
        BCMSShimService.isConnected() ||
        BCMSConfig.local
      ) {
        next();
      } else {
        res.status(403);
        res.setHeader('Content-Type', 'application/json');
        res.send(
          JSON.stringify({
            message:
              'BCMS instance cannot be verified and because of that,' +
              ' it is currently unavailable.',
          }),
        );
        res.end();
      }
    };
  },
});
