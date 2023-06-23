import { createMiddleware } from '@becomes/purple-cheetah';
import type { NextFunction, Request, Response } from 'express';
import * as multer from 'multer';

export const BCMSBackupMediaFileMiddleware = createMiddleware({
  name: 'Backup media file middleware',
  path: '/api/backup/restore-media-file',
  handler() {
    const processFileFunction = multer({
      limits: { fileSize: 10240000000 },
    }).single('media');
    return async (request: Request, _: Response, next: NextFunction) => {
      if (request.method === 'post' || request.method === 'POST') {
        processFileFunction(request, undefined as never, (e: unknown) => {
          if (e) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
