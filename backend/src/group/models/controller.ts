import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';
import {
    type PropChange,
    PropChangeSchema,
} from '@thebcms/selfhosted-backend/prop/models/change';

export interface GroupWhereIsItUsedResult {
    groupIds: string[];
    templateIds: string[];
    widgetIds: string[];
}

export const GroupWhereIsItUsedResultSchema: ObjectSchema = {
    groupIds: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'string',
        },
    },
    templateIds: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'string',
        },
    },
    widgetIds: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'string',
        },
    },
};

export interface GroupCreateBody {
    label: string;
    desc: string;
}

export const GroupCreateBodySchema: ObjectSchema = {
    label: {
        __type: 'string',
        __required: true,
    },
    desc: {
        __type: 'string',
        __required: true,
    },
};

export interface GroupUpdateBody {
    _id: string;
    label?: string;
    desc?: string;
    propChanges?: PropChange[];
}
export const GroupUpdateBodySchema: ObjectSchema = {
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
