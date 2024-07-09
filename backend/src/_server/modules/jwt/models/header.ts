import type { ObjectSchema } from '@thebcms/selfhosted-utils/object-utility';

export type JWTAlgorithm = 'HS256' | 'HS512';
export type JWTType = 'JWT';

export interface JWTHeader {
    typ: JWTType;
    alg: JWTAlgorithm;
}

export const JWTHeaderSchema: ObjectSchema = {
    typ: {
        __type: 'string',
        __required: true,
        __validate(value: string): boolean {
            return ['JWT'].includes(value);
        },
    },
    alg: {
        __type: 'string',
        __required: true,
        __validate(value: string): boolean {
            return ['HS256', 'HS512'].includes(value);
        },
    },
};
