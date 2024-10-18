import {
    type MongoDBEntry,
    MongoDBEntrySchema,
} from '@bcms/selfhosted-backend/_server/modules/mongodb';
import {
    type UserCustomPool,
    UserCustomPoolSchema,
} from '@bcms/selfhosted-backend/user/models/custom-pool';
import type { JWT } from '@bcms/selfhosted-backend/_server/modules/jwt';
import {
    deleteFromSchema,
    type ObjectSchema,
} from '@bcms/selfhosted-utils/object-utility';
import {
    type UserRole,
    UserRoleSchema,
} from '@bcms/selfhosted-backend/user/models/role';

export interface User extends MongoDBEntry {
    username: string;
    email: string;
    password: string;
    roles: UserRole[];
    customPool: UserCustomPool;
}

export const UserSchema: ObjectSchema = {
    ...MongoDBEntrySchema,
    username: {
        __type: 'string',
        __required: true,
    },
    email: {
        __type: 'string',
        __required: true,
    },
    password: {
        __type: 'string',
        __required: true,
    },
    roles: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'object',
            __content: UserRoleSchema,
        },
    },
    customPool: {
        __type: 'object',
        __required: true,
        __child: UserCustomPoolSchema,
    },
};

export type UserProtected = Omit<User, 'password'>;

export const UserProtectedSchema = deleteFromSchema<keyof User>(UserSchema, [
    'password',
]);

export type UserJwt = JWT<UserCustomPool>;
