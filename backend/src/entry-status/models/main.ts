import {
    type MongoDBEntry,
    MongoDBEntrySchema,
} from '@bcms/selfhosted-backend/_server/modules/mongodb';
import type { ObjectSchema } from '@bcms/selfhosted-backend/_utils/object-utility';

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
