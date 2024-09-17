import {
    ObjectUtility,
    ObjectUtilityError,
} from '@bcms/selfhosted-utils/object-utility';
import {
    type JWT,
    type JWTHeader,
    JWTHeaderSchema,
    type JWTPayload,
    JWTPayloadSchema,
} from '@bcms/selfhosted-backend/_server/modules/jwt/models';

export class JWTEncode {
    /**
     * Converts JWT object into JWT string. See [jwt.io](https://jwt.io/) for
     * more information about JWT encoding.
     */
    static encode<PayloadProps>(jwt: JWT<PayloadProps>): string {
        const header = JWTEncode.b64Url(JSON.stringify(jwt.header));
        const payload = JWTEncode.b64Url(JSON.stringify(jwt.payload));
        return header + '.' + payload + '.' + jwt.signature;
    }
    /**
     * Converts JWT string into JWT object. See [jwt.io](https://jwt.io/) for
     * more information about JWT encoding.
     */
    static decode<PayloadProps>(encodedJwt: string): JWT<PayloadProps> | Error {
        if (!encodedJwt) {
            return new Error('Token is `undefined`.');
        }
        if (encodedJwt.startsWith('Bearer ')) {
            encodedJwt = encodedJwt.replace('Bearer ', '');
        }
        const parts: string[] = encodedJwt.split('.');
        if (parts.length !== 3) {
            return new Error('Access token parts length is != 3.');
        }
        try {
            const header: JWTHeader = JSON.parse(
                Buffer.from(parts[0], 'base64').toString(),
            );
            const payload: JWTPayload<PayloadProps> = JSON.parse(
                Buffer.from(parts[1], 'base64').toString(),
            );
            let result = ObjectUtility.compareWithSchema(
                header,
                JWTHeaderSchema,
                'jwt.header',
            );
            if (result instanceof ObjectUtilityError) {
                return Error(result.message);
            }
            result = ObjectUtility.compareWithSchema(
                payload,
                JWTPayloadSchema,
                'jwt.payload',
            );
            if (result instanceof ObjectUtilityError) {
                return Error(result.message);
            }
            return {
                header,
                payload,
                signature: parts[2],
            };
        } catch (error) {
            return new Error('Bad token encoding.');
        }
    }

    /**
     * Encodes the text in a Base64 string which is suitable for
     * usage in URL.
     */
    static b64Url(text: string): string {
        return Buffer.from(text)
            .toString('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }
}
