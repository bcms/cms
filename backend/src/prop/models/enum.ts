import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';

export interface PropEnumData {
    items: string[];
    selected?: string;
}

export const PropEnumDataSchema: ObjectSchema = {
    items: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'string',
        },
    },
    selected: {
        __type: 'string',
        __required: false,
    },
};
