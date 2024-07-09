import {
    type MongoDBEntry,
    MongoDBEntrySchema,
} from '@thebcms/selfhosted-backend/server/modules/mongodb';
import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';

// eslint-disable-next-line no-shadow
export enum MediaType {
    DIR = 'DIR',
    IMG = 'IMG',
    SVG = 'SVG',
    VID = 'VID',
    TXT = 'TXT',
    GIF = 'GIF',
    OTH = 'OTH',
    PDF = 'PDF',
    JS = 'JS',
    HTML = 'HTML',
    CSS = 'CSS',
    JAVA = 'JAVA',
}

export interface Media extends MongoDBEntry {
    userId: string;
    type: MediaType;
    mimetype: string;
    size: number;
    name: string;
    isInRoot: boolean;
    hasChildren: boolean;
    parentId: string;
    altText: string;
    caption: string;
    width: number;
    height: number;
}

export const MediaSchema: ObjectSchema = {
    ...MongoDBEntrySchema,
    userId: {
        __type: 'string',
        __required: true,
    },
    type: {
        __type: 'string',
        __required: true,
    },
    mimetype: {
        __type: 'string',
        __required: true,
    },
    size: {
        __type: 'number',
        __required: true,
    },
    name: {
        __type: 'string',
        __required: true,
    },
    isInRoot: {
        __type: 'boolean',
        __required: true,
    },
    hasChildren: {
        __type: 'boolean',
        __required: true,
    },
    parentId: {
        __type: 'string',
        __required: true,
    },
    altText: {
        __type: 'string',
        __required: true,
    },
    caption: {
        __type: 'string',
        __required: true,
    },
    width: {
        __type: 'number',
        __required: true,
    },
    height: {
        __type: 'number',
        __required: true,
    },
};
