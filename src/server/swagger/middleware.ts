import { MiddlewarePrototype, Middleware, Logger } from '@becomes/purple-cheetah';
import { RequestHandler, ErrorRequestHandler } from 'express';
import * as swaggerUI from 'swagger-ui-express';

@Middleware({
  uri: '/api/swagger',
  after: false,
  handler: swaggerUI.serve,
})
export class SwaggerMiddleware implements MiddlewarePrototype {
  uri?: string;
  logger: Logger;
  after: boolean;
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler;
}
