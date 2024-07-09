import {
    type MongoDBEntry,
    MongoDBEntrySchema,
} from '@thebcms/selfhosted-backend/server/modules/mongodb';
import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';

export interface EntryStatus extends MongoDBEntry {
    userId: string;
    label: string;
    color?: string;
}

export const EntryStatusSchema: ObjectSchema = {
    ...MongoDBEntrySchema,
    userId: {
        __type: 'string',
        __required: true,
    },
    label: {
        __type: 'string',
        __required: true,
    },
    color: {
        __type: 'string',
        __required: false,
    },
};
