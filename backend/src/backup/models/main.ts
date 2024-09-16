import {
    type MongoDBEntry,
    MongoDBEntrySchema,
} from '@thebcms/selfhosted-backend/_server/modules/mongodb';
import type { ObjectSchema } from '@thebcms/selfhosted-utils/object-utility';

export interface Backup extends MongoDBEntry {
    doneAt: number;
    userId: string;
    name: string;
    size: number;
    ready: boolean;
    inQueue: boolean;
}

export const BackupSchema: ObjectSchema = {
    ...MongoDBEntrySchema,
    doneAt: {
        __type: 'number',
        __required: true,
    },
    userId: {
        __type: 'string',
        __required: true,
    },
    name: {
        __type: 'string',
        __required: true,
    },
    size: {
        __type: 'number',
        __required: true,
    },
    ready: {
        __type: 'boolean',
        __required: true,
    },
    inQueue: {
        __type: 'boolean',
        __required: true,
    },
};
