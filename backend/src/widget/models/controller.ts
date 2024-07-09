import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';
import {
    type PropChange,
    PropChangeSchema,
} from '@thebcms/selfhosted-backend/prop/models/change';

export interface WidgetWhereIsItUsedResult {
    entryIds: string[];
}

export const WidgetWhereIsItUsedResultSchema: ObjectSchema = {
    entryIds: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'string',
        },
    },
};

export interface WidgetCreateBody {
    label: string;
    desc: string;
}

export const WidgetCreateBodySchema: ObjectSchema = {
    label: {
        __type: 'string',
        __required: true,
    },
    desc: {
        __type: 'string',
        __required: true,
    },
};

export interface WidgetUpdateBody {
    _id: string;
    label?: string;
    desc?: string;
    propChanges?: PropChange[];
}
export const WidgetUpdateBodySchema: ObjectSchema = {
    _id: {
        __type: 'string',
        __required: true,
    },
    label: {
        __type: 'string',
        __required: false,
    },
    desc: {
        __type: 'string',
        __required: false,
    },
    propChanges: {
        __type: 'array',
        __required: false,
        __child: {
            __type: 'object',
            __content: PropChangeSchema,
        },
    },
};
