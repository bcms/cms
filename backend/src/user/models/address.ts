import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';

export interface UserAddress {
    country?: string;
    city?: string;
    state?: string;
    zip?: string;
    street?: {
        name: string;
        number: string;
    };
}

export const UserAddressSchema: ObjectSchema = {
    country: {
        __type: 'string',
        __required: false,
    },
    city: {
        __type: 'string',
        __required: false,
    },
    state: {
        __type: 'string',
        __required: false,
    },
    zip: {
        __type: 'string',
        __required: false,
    },
    street: {
        __type: 'object',
        __required: false,
        __child: {
            name: {
                __type: 'string',
                __required: true,
            },
            number: {
                __type: 'string',
                __required: true,
            },
        },
    },
};
