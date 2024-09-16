import {
    type HttpErrorHandler,
    HttpStatus,
} from '@thebcms/selfhosted-backend/_server';
import type { UserJwt } from '@thebcms/selfhosted-backend/user/models/main';
import {
    JWTError,
    JWTManager,
} from '@thebcms/selfhosted-backend/_server/modules/jwt';
import type { UserRoleName } from '@thebcms/selfhosted-backend/user/models/role';
import type { UserCustomPool } from '@thebcms/selfhosted-backend/user/models/custom-pool';

export class RPJwt {
    verify(
        errorHandler: HttpErrorHandler,
        tokenAsString?: string | string[],
        roles?: UserRoleName[],
    ): UserJwt {
        if (roles) {
            roles.push('ADMIN');
        } else if (!roles) {
            roles = ['USER', 'ADMIN'];
        }
        const token = JWTManager.get<UserCustomPool>({
            token: (tokenAsString + '').replace('Bearer ', ''),
            roles,
        });
        if (token instanceof JWTError) {
            throw errorHandler(HttpStatus.Forbidden, token.message);
        }
        if (token.payload.rls.includes('SUDO')) {
            return token;
        }
        return token;
    }
}
