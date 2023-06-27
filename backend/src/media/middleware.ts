import { createMiddleware } from '@becomes/purple-cheetah';
import type { NextFunction, Request, Response } from 'express';
import * as multer from 'multer';

export const BCMSMediaMiddleware = createMiddleware({
  name: 'Media middleware',
  path: '/api/media/file',
  handler() {
    const processFileFunction = multer({
      limits: { fileSize: 102400000 },
    }).single('media');
    return async (request: Request, _: Response, next: NextFunction) => {
      if (request.method === 'post' || request.method === 'POST') {
        processFileFunction(request, undefined as never, (e: unknown) => {
          if (e) {
            request.headers.upload_file_error_message = (e as any).message;
          }
          next();
        });
      } else {
        next();
      }
    };
  },
});
