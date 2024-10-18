import * as crypto from 'crypto';
import {
    ObjectUtility,
    ObjectUtilityError,
} from '@bcms/selfhosted-utils/object-utility';
import { JWTEncode } from '@bcms/selfhosted-backend/_server/modules/jwt/encode';
import { JWTError } from '@bcms/selfhosted-backend/_server/modules/jwt/error';
import {
    type JWT,
    JWTSchema,
    type JWTScope,
} from '@bcms/selfhosted-backend/_server/modules/jwt/models';

export interface JWTManagerCreateData<
    PayloadProps = undefined,
    Roles extends string[] = string[],
> {
    issuer: string;
    userId: string;
    roles: Roles;
    props?: PayloadProps;
}

export interface JWTManagerCheckPermissionsData<PayloadProps> {
    jwt: JWT<PayloadProps>;
    roles: string[];
}

export interface JWTManagerGetData {
    token: string;
    roles: string[];
}

export class JWTManager {
    private static scopes: {
        [issuer: string]: JWTScope;
    } = {};

    static setScopes(scopes: JWTScope[]): void {
        for (let i = 0; i < scopes.length; i++) {
            const scope = scopes[i];
            if (!JWTManager.scopes[scope.issuer]) {
                JWTManager.scopes[scope.issuer] = scope;
            }
        }
    }

    static create<PayloadProps = undefined, Roles extends string[] = string[]>(
        data: JWTManagerCreateData<PayloadProps, Roles>,
    ): JWT<PayloadProps> | JWTError {
        const scope = JWTManager.scopes[data.issuer];
        if (!scope) {
            return new JWTError(
                'e2',
                `JWT information does not exist for issuer "${data.issuer}"`,
            );
        }
        const jwt: JWT<PayloadProps> = {
            header: {
                typ: 'JWT',
                alg: scope.alg,
            },
            payload: {
                jti: crypto
                    .createHash('sha1')
                    .update(
                        Date.now() + crypto.randomBytes(8).toString('base64'),
                    )
                    .digest('hex'),
                iss: data.issuer,
                exp: scope.expIn,
                iat: Date.now(),
                userId: data.userId,
                rls: data.roles,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                props: data.props ? data.props : ({} as any),
            },
            signature: '',
        };
        return JWTManager.sign(jwt);
    }

    static sign<PayloadProps>(
        jwt: JWT<PayloadProps>,
    ): JWT<PayloadProps> | JWTError {
        const scope = JWTManager.scopes[jwt.payload.iss];
        if (!scope) {
            return new JWTError(
                'e3',
                `JWT information does not exist for issuer "${jwt.payload.iss}"`,
            );
        }
        const encodedJwt = JWTEncode.encode(jwt);
        const jwtParts = encodedJwt.split('.');
        const header = jwtParts[0];
        const payload = jwtParts[1];
        let hmac: crypto.Hmac;
        switch (jwt.header.alg) {
            case 'HS256':
                {
                    hmac = crypto.createHmac('sha256', scope.secret);
                }
                break;
            case 'HS512':
                {
                    hmac = crypto.createHmac('sha512', scope.secret);
                }
                break;
        }
        hmac.setEncoding('base64url');
        hmac.write(header + '.' + payload);
        hmac.end();

        return {
            header: jwt.header,
            payload: jwt.payload,
            signature: hmac.read().toString(),
        };
    }

    static validate<PayloadProps = undefined>(
        jwt: JWT<PayloadProps>,
    ): void | JWTError {
        const checkObject = ObjectUtility.compareWithSchema(
            jwt,
            JWTSchema,
            'jwt',
        );
        if (checkObject instanceof ObjectUtilityError) {
            return new JWTError('e4', checkObject.message);
        }
        const scope = JWTManager.scopes[jwt.payload.iss];
        if (!scope) {
            return new JWTError(
                'e5',
                `JWT information does not exist for issuer "${jwt.payload.iss}"`,
            );
        }
        if (jwt.payload.iat + jwt.payload.exp < Date.now()) {
            return new JWTError('e6', 'Token has expired.');
        }
        const checkSign = JWTManager.sign(jwt);
        if (checkSign instanceof JWTError) {
            return checkSign;
        }
        if (checkSign.signature !== jwt.signature) {
            return new JWTError('e8', 'Invalid signature.');
        }
    }

    static checkPermissions<PayloadProps = undefined>(
        data: JWTManagerCheckPermissionsData<PayloadProps>,
    ): void | JWTError {
        const role = data.jwt.payload.rls.find((r) =>
            data.roles.find((rn) => rn === r),
        );
        if (!role) {
            return new JWTError(
                'e9',
                'Token is not authorized for this action.',
            );
        }
    }

    static validateAndCheckPermissions<PayloadProps = undefined>(
        data: JWTManagerCheckPermissionsData<PayloadProps>,
    ): void | JWTError {
        let error = JWTManager.validate(data.jwt);
        if (error instanceof JWTError) {
            return error;
        }
        error = JWTManager.checkPermissions(data);
        if (error instanceof JWTError) {
            return error;
        }
    }

    static get<PayloadProps = undefined>(
        data: JWTManagerGetData,
    ): JWTError | JWT<PayloadProps> {
        const jwt = JWTEncode.decode<PayloadProps>(data.token);
        if (jwt instanceof Error) {
            return new JWTError('e1', jwt.message);
        } else {
            const jwtValid =
                JWTManager.validateAndCheckPermissions<PayloadProps>({
                    jwt,
                    roles: data.roles,
                });
            if (jwtValid instanceof JWTError) {
                return jwtValid;
            }
        }
        return jwt;
    }
}
