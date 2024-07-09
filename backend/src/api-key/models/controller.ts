import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';
import {
    type ApiKeyAccess,
    ApiKeyAccessSchema,
} from '@thebcms/selfhosted-backend/api-key/models/access';

export interface ApiKeyCreateBody {
    name: string;
    desc: string;
}

export const ApiKeyCreateBodySchema: ObjectSchema = {
    name: {
        __type: 'string',
        __required: true,
    },
    desc: {
        __type: 'string',
        __required: true,
    },
};

export interface ApiKeyUpdateBody {
    _id: string;
    name?: string;
    desc?: string;
    blocked?: boolean;
    access?: ApiKeyAccess;
}

export const ApiKeyUpdateBodySchema: ObjectSchema = {
    _id: {
        __type: 'string',
        __required: true,
    },
    name: {
        __type: 'string',
        __required: false,
    },
    desc: {
        __type: 'string',
        __required: false,
    },
    blocked: {
        __type: 'boolean',
        __required: false,
    },
    access: {
        __type: 'object',
        __required: false,
        __child: ApiKeyAccessSchema,
    },
};
