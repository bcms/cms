import type { ObjectSchema } from '@thebcms/selfhosted-utils/object-utility';

export interface JWTPayload<
    Props = undefined,
    Roles extends string[] = string[],
> {
    jti: string;
    iss: string;
    iat: number;
    exp: number;
    userId: string;
    rls: Roles;
    props: Props;
}
export const JWTPayloadSchema: ObjectSchema = {
    jti: {
        __type: 'string',
        __required: true,
    },
    iss: {
        __type: 'string',
        __required: true,
    },
    iat: {
        __type: 'number',
        __required: true,
    },
    exp: {
        __type: 'number',
        __required: true,
    },
    rls: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'string',
        },
    },
};
