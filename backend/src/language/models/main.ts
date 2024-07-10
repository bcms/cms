import {
    type MongoDBEntry,
    MongoDBEntrySchema,
} from '@thebcms/selfhosted-backend/server/modules/mongodb';
import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';

export interface Language extends MongoDBEntry {
    userId: string;
    code: string;
    name: string;
    nativeName: string;
    default: boolean;
}

export const LanguageSchema: ObjectSchema = {
    ...MongoDBEntrySchema,
    userId: {
        __type: 'string',
        __required: true,
    },
    code: {
        __type: 'string',
        __required: true,
    },
    name: {
        __type: 'string',
        __required: true,
    },
    nativeName: {
        __type: 'string',
        __required: true,
    },
    default: {
        __type: 'boolean',
        __required: true,
    },
};