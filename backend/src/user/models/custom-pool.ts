import {
    type UserAddress,
    UserAddressSchema,
} from '@thebcms/selfhosted-backend/user/models/address';
import {
    type UserPolicy,
    UserPolicySchema,
} from '@thebcms/selfhosted-backend/user/models/policy';
import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';
import {
    type UserPersonal,
    UserPersonalSchema,
} from '@thebcms/selfhosted-backend/user/models/personal';

export interface UserCustomPool {
    personal: UserPersonal;
    address: UserAddress;
    policy: UserPolicy;
}

export const UserCustomPoolSchema: ObjectSchema = {
    personal: {
        __type: 'object',
        __required: true,
        __child: UserPersonalSchema,
    },
    address: {
        __type: 'object',
        __required: true,
        __child: UserAddressSchema,
    },
    policy: {
        __type: 'object',
        __required: true,
        __child: UserPolicySchema,
    },
};
