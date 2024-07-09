import {
    type MongoDBEntry,
    MongoDBEntrySchema,
} from '@thebcms/selfhosted-backend/server/modules/mongodb';
import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';
import {
    type Prop,
    PropSchema,
} from '@thebcms/selfhosted-backend/prop/models/main';

export interface Widget extends MongoDBEntry {
    userId: string;
    name: string;
    label: string;
    desc: string;
    previewImage: string;
    props: Prop[];
}

export const WidgetSchema: ObjectSchema = {
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
    previewImage: {
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
