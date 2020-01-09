import * as swaggerUI from 'swagger-ui-express';
import { RequestHandler, ErrorRequestHandler } from 'express';
import { Middleware } from 'purple-cheetah';

export class SwaggerServerMiddleware implements Middleware {
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler;
  uri?: string;

  constructor() {
    this.uri = '/docs/swagger';
    this.handler = swaggerUI.serve;
  }
}
