import {
    type UserPolicyCRUD,
    UserPolicyCRUDSchema,
} from '@bcms/selfhosted-backend/user/models/policy';
import type { ObjectSchema } from '@bcms/selfhosted-backend/_utils/object-utility';

export interface ApiKeyAccess {
    templates: Array<UserPolicyCRUD & { _id: string; name?: string }>;
    functions: Array<{ name: string }>;
    plugins?: Array<{ name: string }>;
}

export const ApiKeyAccessSchema: ObjectSchema = {
    templates: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'object',
            __content: {
                ...UserPolicyCRUDSchema,
                _id: {
                    __type: 'string',
                    __required: true,
                },
                name: {
                    __type: 'string',
                    __required: false,
                },
            },
        },
    },
    functions: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'object',
            __content: {
                name: {
                    __type: 'string',
                    __required: true,
                },
            },
        },
    },
    plugins: {
        __type: 'array',
        __required: false,
        __child: {
            __type: 'object',
            __content: {
                name: {
                    __type: 'string',
                    __required: true,
                },
            },
        },
    },
};
