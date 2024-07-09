import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';
import type {
    HttpErrorHandler,
    Logger,
} from '@thebcms/selfhosted-backend/server';
import type { ApiKey } from '@thebcms/selfhosted-backend/api-key/models/main';
import type { JWT } from '@thebcms/selfhosted-backend/server/modules/jwt';
import type { UserCustomPool } from '@thebcms/selfhosted-backend/user/models/custom-pool';

export interface BCMSFunctionConfig {
    /**
     * Will be converted to lowercase without
     * special characters and spaces will be
     * replaced with "-".
     */
    name: string;
    /**
     * If set to "true", anyone can call this
     * function. Defaults to "false".
     */
    public?: boolean;
}
export const BCMSFunctionConfigSchema: ObjectSchema = {
    name: {
        __type: 'string',
        __required: true,
    },
    public: {
        __type: 'boolean',
        __required: false,
    },
};

export interface BCMSFunction<Result = unknown> {
    config: BCMSFunctionConfig;
    handler(data: {
        request: Request;
        errorHandler: HttpErrorHandler;
        logger: Logger;
        auth: ApiKey | JWT<UserCustomPool>;
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
