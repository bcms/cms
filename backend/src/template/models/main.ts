import {
    type MongoDBEntry,
    MongoDBEntrySchema,
} from '@thebcms/selfhosted-backend/server/modules/mongodb';
import {
    type Prop,
    PropSchema,
} from '@thebcms/selfhosted-backend/prop/models/main';
import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';

export interface Template extends MongoDBEntry {
    name: string;
    label: string;
    desc: string;
    userId?: string;
    singleEntry: boolean;
    props: Prop[];
}

export const TemplateSchema: ObjectSchema = {
    ...MongoDBEntrySchema,
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
    userId: {
        __type: 'string',
        __required: false,
    },
    singleEntry: {
        __type: 'boolean',
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