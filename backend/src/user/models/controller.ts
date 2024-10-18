import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';
import {
    type UserPolicyCRUD,
    UserPolicyCRUDSchema,
    type UserPolicyPlugin,
    UserPolicyPluginSchema,
    type UserPolicyTemplate,
    UserPolicyTemplateSchema,
} from '@bcms/selfhosted-backend/user/models/policy';
import type { UserRoleName } from '@bcms/selfhosted-backend/user/models/role';

export interface UserUpdateBody {
    _id: string;
    role?: UserRoleName;
    password?: string;
    email?: string;
    customPool?: {
        personal?: {
            firstName?: string;
            lastName?: string;
        };
        policy?: {
            media?: UserPolicyCRUD;
            templates?: UserPolicyTemplate[];
            plugins?: UserPolicyPlugin[];
        };
    };
}

export const UserUpdateBodySchema: ObjectSchema = {
    _id: {
        __type: 'string',
        __required: true,
    },
    role: {
        __type: 'string',
        __required: false,
    },
    password: {
        __type: 'string',
        __required: false,
    },
    email: {
        __type: 'string',
        __required: false,
    },
    customPool: {
        __type: 'object',
        __required: false,
        __child: {
            personal: {
                __type: 'object',
                __required: false,
                __child: {
                    firstName: {
                        __type: 'string',
                        __required: false,
                    },
                    lastName: {
                        __type: 'string',
                        __required: false,
                    },
                },
            },
            policy: {
                __type: 'object',
                __required: false,
                __child: {
                    media: {
                        __type: 'object',
                        __required: false,
                        __child: UserPolicyCRUDSchema,
                    },
                    templates: {
                        __type: 'array',
                        __required: false,
                        __child: {
                            __type: 'object',
                            __content: UserPolicyTemplateSchema,
                        },
                    },
                    plugins: {
                        __type: 'array',
                        __required: false,
                        __child: {
                            __type: 'object',
                            __content: UserPolicyPluginSchema,
                        },
                    },
                },
            },
        },
    },
};

export interface UserCreateBody {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRoleName;
}

export const UserCreateBodySchema: ObjectSchema = {
    email: {
        __type: 'string',
        __required: true,
    },
    password: {
        __type: 'string',
        __required: true,
    },
    firstName: {
        __type: 'string',
        __required: true,
    },
    lastName: {
        __type: 'string',
        __required: true,
    },
    role: {
        __type: 'string',
        __required: true,
    },
};

export interface UserStatsResponse {
    entryCount: number;
    mediaCount: number;
    mediaSize: number;
    userCount: number;
}

export const UserStatsResponseSchema: ObjectSchema = {
    entryCount: {
        __type: 'number',
        __required: true,
    },
    mediaCount: {
        __type: 'number',
        __required: true,
    },
    mediaSize: {
        __type: 'number',
        __required: true,
    },
    userCount: {
        __type: 'number',
        __required: true,
    },
};
