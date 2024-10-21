import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';
import type {
    HttpErrorHandler,
    Logger,
} from '@bcms/selfhosted-backend/_server';
import type { ApiKey } from '@bcms/selfhosted-backend/api-key/models/main';
import type { FastifyRequest } from 'fastify';

export interface BCMSFunctionConfig {
    /**
     * Will be converted to lowercase without
     * special characters and spaces will be
     * replaced with "-".
     */
    name: string;
}
export const BCMSFunctionConfigSchema: ObjectSchema = {
    name: {
        __type: 'string',
        __required: true,
    },
};

export interface BCMSFunction<Result = unknown> {
    config: BCMSFunctionConfig;
    handler(data: {
        request: FastifyRequest;
        errorHandler: HttpErrorHandler;
        logger: Logger;
        apiKey: ApiKey;
    }): Promise<Result>;
}
export const BCMSFunctionSchema: ObjectSchema = {
    config: {
        __type: 'object',
        __required: true,
        __child: BCMSFunctionConfigSchema,
    },
    handler: {
        __type: 'function',
        __required: true,
    },
};
