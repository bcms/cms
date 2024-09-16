import {
    type JWTHeader,
    JWTHeaderSchema,
} from '@thebcms/selfhosted-backend/_server/modules/jwt/models/header';
import {
    type JWTPayload,
    JWTPayloadSchema,
} from '@thebcms/selfhosted-backend/_server/modules/jwt/models/payload';
import type { ObjectSchema } from '@thebcms/selfhosted-utils/object-utility';

export interface JWT<PayloadProps = undefined> {
    header: JWTHeader;
    payload: JWTPayload<PayloadProps>;
    signature: string;
}

export const JWTSchema: ObjectSchema = {
    header: {
        __type: 'object',
        __required: true,
        __child: JWTHeaderSchema,
    },
    payload: {
        __type: 'object',
        __required: true,
        __child: JWTPayloadSchema,
    },
};
