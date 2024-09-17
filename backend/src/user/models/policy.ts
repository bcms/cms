import type { ObjectSchema } from '@bcms/selfhosted-backend/_utils/object-utility';

export interface UserPolicyCRUD {
    get: boolean;
    post: boolean;
    put: boolean;
    delete: boolean;
}
export const UserPolicyCRUDSchema: ObjectSchema = {
    get: {
        __type: 'boolean',
        __required: true,
    },
    post: {
        __type: 'boolean',
        __required: true,
    },
    put: {
        __type: 'boolean',
        __required: true,
    },
    delete: {
        __type: 'boolean',
        __required: true,
    },
};

export interface UserPolicyTemplate extends UserPolicyCRUD {
    _id: string;
}
export const UserPolicyTemplateSchema: ObjectSchema = {
    ...UserPolicyCRUDSchema,
    _id: {
        __type: 'string',
        __required: true,
    },
};

export interface UserPolicyPluginOption {
    name: string;
    value: string[];
}
export const UserPolicyPluginOptionSchema: ObjectSchema = {
    name: {
        __type: 'string',
        __required: true,
    },
    value: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'string',
        },
    },
};

export interface UserPolicyPlugin {
    name: string;
    allowed: boolean;
    fullAccess: boolean;
    options: UserPolicyPluginOption[];
}
export const UserPolicyPluginSchema: ObjectSchema = {
    name: {
        __type: 'string',
        __required: true,
    },
    allowed: {
        __type: 'boolean',
        __required: true,
    },
    fullAccess: {
        __type: 'boolean',
        __required: true,
    },
    options: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'object',
            __content: UserPolicyPluginOptionSchema,
        },
    },
};

export interface UserPolicy {
    media: UserPolicyCRUD;
    templates: UserPolicyTemplate[];
    plugins?: UserPolicyPlugin[];
}
export const UserPolicySchema: ObjectSchema = {
    media: {
        __type: 'object',
        __required: true,
        __child: UserPolicyCRUDSchema,
    },
    templates: {
        __type: 'array',
        __required: true,
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
};
