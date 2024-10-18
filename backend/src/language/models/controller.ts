import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';

export interface LanguageCreateBody {
    code: string;
    name: string;
    nativeName: string;
}

export const LanguageCreateBodySchema: ObjectSchema = {
    code: {
        __type: 'string',
        __required: true,
    },
    name: {
        __type: 'string',
        __required: true,
    },
    nativeName: {
        __type: 'string',
        __required: true,
    },
};
