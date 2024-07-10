import {
    type MongoDBEntry,
    MongoDBEntrySchema,
} from '@thebcms/selfhosted-backend/server/modules/mongodb';
import {
    deleteFromSchema,
    type ObjectSchema,
} from '@thebcms/selfhosted-backend/_utils/object-utility';
import {
    type EntryStatusValue,
    EntryStatusValueSchema,
} from '@thebcms/selfhosted-backend/entry/models/status';
import {
    type EntryMeta,
    type EntryMetaParsed,
    EntryMetaSchema,
} from '@thebcms/selfhosted-backend/entry/models/meta';
import {
    type EntryContent,
    type EntryContentParsed,
    EntryContentSchema,
} from '@thebcms/selfhosted-backend/entry/models/content';

export interface Entry extends MongoDBEntry {
    templateId: string;
    userId: string;
    statuses: EntryStatusValue[];
    meta: EntryMeta[];
    content: EntryContent[];
}

export const EntrySchema: ObjectSchema = {
    ...MongoDBEntrySchema,
    templateId: {
        __type: 'string',
        __required: true,
    },
    userId: {
        __type: 'string',
        __required: true,
    },
    statuses: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'object',
            __content: EntryStatusValueSchema,
        },
    },
    meta: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'object',
            __content: EntryMetaSchema,
        },
    },
    content: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'object',
            __content: EntryContentSchema,
        },
    },
};

export interface EntryLiteInfo {
    status?: string;
    lng: string;
    title: string;
    slug: string;
    description?: string;
    media?: string;
}

export const EntryLiteInfoSchema: ObjectSchema = {
    title: {
        __type: 'string',
        __required: true,
    },
    slug: {
        __type: 'string',
        __required: true,
    },
    description: {
        __type: 'string',
        __required: false,
    },
    media: {
        __type: 'string',
        __required: false,
    },
};

export interface EntryLite
    extends Omit<Entry, 'meta' | 'content' | 'statuses'> {
    info: EntryLiteInfo[];
}

export const EntryLiteSchema: ObjectSchema = {
    ...deleteFromSchema(EntrySchema, ['meta', 'content']),
    info: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'object',
            __content: EntryLiteInfoSchema,
        },
    },
};

export interface EntryParsed extends MongoDBEntry {
    templateId: string;
    templateName: string;
    userId: string;
    statuses: EntryStatusValue[];
    meta: EntryMetaParsed;
    content: EntryContentParsed;
}