import {
    type MongoDBEntry,
    MongoDBEntrySchema,
} from '@bcms/selfhosted-backend/_server/modules/mongodb';
import {
    type ApiKeyAccess,
    ApiKeyAccessSchema,
} from '@bcms/selfhosted-backend/api-key/models/access';
import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';

export interface ApiKey extends MongoDBEntry {
    userId: string;
    name: string;
    desc: string;
    blocked: boolean;
    secret: string;
    access: ApiKeyAccess;
}

export const ApiKeySchema: ObjectSchema = {
    ...MongoDBEntrySchema,
    userId: {
        __type: 'string',
        __required: true,
    },
    name: {
        __type: 'string',
        __required: true,
    },
    desc: {
        __type: 'string',
        __required: true,
    },
    blocked: {
        __type: 'boolean',
        __required: true,
    },
    secret: {
        __type: 'string',
        __required: true,
    },
    access: {
        __type: 'object',
        __required: true,
        __child: ApiKeyAccessSchema,
    },
};
