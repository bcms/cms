import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';

export interface EntryStatusValue {
    lng: string;
    id: string;
}

export const EntryStatusValueSchema: ObjectSchema = {
    lng: {
        __type: 'string',
        __required: true,
    },
    id: {
        __type: 'string',
        __required: true,
    },
};
