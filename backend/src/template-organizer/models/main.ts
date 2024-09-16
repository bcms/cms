import {
    type MongoDBEntry,
    MongoDBEntrySchema,
} from '@thebcms/selfhosted-backend/_server/modules/mongodb';
import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';

export interface TemplateOrganizer extends MongoDBEntry {
    parentId?: string;
    label: string;
    name: string;
    templateIds: string[];
}

export const TemplateOrganizerSchema: ObjectSchema = {
    ...MongoDBEntrySchema,
    parentId: {
        __type: 'string',
        __required: false,
    },
    label: {
        __type: 'string',
        __required: true,
    },
    name: {
        __type: 'string',
        __required: true,
    },
    templateIds: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'string',
        },
    },
};
