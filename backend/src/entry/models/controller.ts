import {
    type EntryStatusValue,
    EntryStatusValueSchema,
} from '@thebcms/selfhosted-backend/entry/models/status';
import {
    type EntryMeta,
    EntryMetaSchema,
} from '@thebcms/selfhosted-backend/entry/models/meta';
import {
    type EntryContent,
    type EntryContentNode,
    EntryContentSchema,
} from '@thebcms/selfhosted-backend/entry/models/content';
import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';
import type { PropValue } from '@thebcms/selfhosted-backend/prop/models/main';

export interface EntryCreateBody {
    statuses: EntryStatusValue[];
    meta: EntryMeta[];
    content: EntryContent[];
}

export const EntryCreateBodySchema: ObjectSchema = {
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

export interface EntryUpdateBody {
    _id: string;
    templateId: string;
    status?: string;
    lng: string;
    meta: { props: PropValue[] };
    content: {
        nodes: EntryContentNode[];
    };
}

export const EntryUpdateBodySchema: ObjectSchema = {
    _id: {
        __type: 'string',
        __required: false,
    },
    status: {
        __type: 'string',
        __required: false,
    },
    lng: {
        __type: 'string',
        __required: false,
    },
    meta: {
        __type: 'object',
        __required: true,
        __child: {
            props: {
                __type: 'array',
                __required: true,
                __child: {
                    __type: 'object',
                    __content: {
                        id: {
                            __type: 'string',
                            __required: true,
                        },
                    },
                },
            },
        },
    },
};
