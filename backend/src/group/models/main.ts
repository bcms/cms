import {
    type MongoDBEntry,
    MongoDBEntrySchema,
} from '@bcms/selfhosted-backend/_server/modules/mongodb';
import {
    type Prop,
    PropSchema,
} from '@bcms/selfhosted-backend/prop/models/main';
import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';

export interface Group extends MongoDBEntry {
    userId: string;
    name: string;
    label: string;
    desc: string;
    props: Prop[];
}

export const GroupSchema: ObjectSchema = {
    ...MongoDBEntrySchema,
    userId: {
        __type: 'string',
        __required: true,
    },
    name: {
        __type: 'string',
        __required: true,
    },
    label: {
        __type: 'string',
        __required: true,
    },
    desc: {
        __type: 'string',
        __required: true,
    },
    props: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'object',
            __content: PropSchema,
        },
    },
};
