import type { ObjectSchema } from '@thebcms/selfhosted-utils/object-utility';

export type UserRolePermissionName = 'READ' | 'WRITE' | 'DELETE' | 'EXECUTE';

export interface UserRolePermission {
    name: UserRolePermissionName;
}

export const UserRolePermissionSchema: ObjectSchema = {
    name: {
        __type: 'string',
        __required: true,
    },
};

export type UserRoleName = 'ADMIN' | 'USER';

export interface UserRole {
    name: UserRoleName;
    permissions: UserRolePermission[];
}

export const UserRoleSchema: ObjectSchema = {
    name: {
        __type: 'string',
        __required: true,
    },
    permissions: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'object',
            __content: UserRolePermissionSchema,
        },
    },
};
