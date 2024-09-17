import type { IncomingMessage, ServerResponse } from 'http';
import { Logger } from '@bcms/selfhosted-backend/_server/logger';
import {
    createHttpErrorHandler,
    type HttpErrorHandler,
    type HttpException,
} from '@bcms/selfhosted-backend/_server/http-error';

export interface MiddlewareHandler {
    (
        req: IncomingMessage,
        res: ServerResponse,
        next: () => void,
    ): Promise<void> | void;
}

export interface MiddlewareConfig {
    /**
     * Name of the middleware. Used for organizing logs and errors.
     */
    name: string;
    /**
     * All request path which are starting with specified
     * path will be caught by the middleware.
     */
    path?: string;
    /**
     * Business logic implementation.
     */
    handler(data: {
        /**
         * Middleware name.
         */
        name: string;
        /**
         * Path of the middleware.
         */
        path: string;
        /**
         * Generated middleware logger.
         */
        logger: Logger;
        errorHandler: HttpErrorHandler;
    }): MiddlewareHandler | Promise<MiddlewareHandler>;
}

export type Middleware = () => MiddlewareData;

export interface MiddlewareData {
    name: string;
    path: string;
    handler(): MiddlewareHandler | Promise<MiddlewareHandler>;
}

/**
 * Will create a middleware object using specified configuration.
 */
export function createMiddleware(config: MiddlewareConfig): Middleware {
    let path = '/';
    if (config.path) {
        path = config.path.startsWith('/') ? config.path : '/' + config.path;
    }
    const logger = new Logger(config.name);
    const errorHandler = createHttpErrorHandler({
        logger,
        place: '',
    });
    return () => {
        return {
            path,
            name: config.name,
            handler: async () => {
                const handler = await config.handler({
                    name: config.name,
                    path,
                    logger,
                    errorHandler,
                });
                return async (request, response, next) => {
                    try {
                        await handler(request, response, next);
                    } catch (error) {
                        const exception = error as unknown as HttpException;
                        if (exception.status && exception.message) {
                            logger.warn(request.url || '', error);
                            if (typeof exception.message === 'object') {
                                response.statusCode = exception.status;
                                response.setHeader(
                                    'Content-Type',
                                    'application/json',
                                );
                                response.write(
                                    JSON.stringify(exception.message),
                                );
                                response.end();
                                return;
                            } else {
                                response.statusCode = exception.status;
                                response.setHeader(
                                    'Content-Type',
                                    'application/json',
                                );
                                response.write(
                                    JSON.stringify({
                                        message: exception.message,
                                    }),
                                );
                                response.end();
                                return;
                            }
                        } else {
                            logger.error(request.url || '', {
                                method: request.method,
                                path: request.url,
                                error: {
                                    message: (error as Error).message,
                                    stack: (error as Error).stack
                                        ? (
                                              (error as Error).stack as string
                                          ).split('\n')
                                        : '',
                                },
                            });
                            response.statusCode = 500;
                            response.setHeader(
                                'Content-Type',
                                'application/json',
                            );
                            response.write(
                                JSON.stringify({
                                    message: 'Unknown exception',
                                }),
                            );
                            response.end();
                            return;
                        }
                    }
                };
            },
        };
    };
}
