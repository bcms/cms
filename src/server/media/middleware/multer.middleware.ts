import * as multer from 'multer';
import { Middleware } from 'purple-cheetah';
import { RequestHandler, NextFunction, Response, Request } from 'express';

export class MulterMediaMiddleware implements Middleware {
  uri?: string = '/media/file';
  processFileFunction = multer({ limits: { fileSize: 102400000 } }).single(
    'media_file',
  );
  handler: RequestHandler = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    if (request.method === 'post' || request.method === 'POST') {
      this.processFileFunction(request, undefined, e => {
        if (e) {
          request.headers.upload_file_error_message = e.message;
        }
        next();
      });
    } else {
      next();
    }
  }
}
