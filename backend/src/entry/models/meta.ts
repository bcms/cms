import type {
    PropParsed,
    PropValue,
} from '@bcms/selfhosted-backend/prop/models/main';
import type { ObjectSchema } from '@bcms/selfhosted-backend/_utils/object-utility';

export interface EntryMeta {
    lng: string;
    props: PropValue[];
}

export const EntryMetaSchema: ObjectSchema = {
    lng: {
        __type: 'string',
        __required: true,
    },
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
};

export interface EntryMetaParsed {
    [lng: string]: PropParsed;
}
