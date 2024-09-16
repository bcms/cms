import { createMiddleware } from '@thebcms/selfhosted-backend/_server';
import type { JWTPayload } from '@thebcms/selfhosted-backend/_server/modules/jwt';
import type { UserCustomPool } from '@thebcms/selfhosted-backend/user/models/custom-pool';

export const IPMiddleware = createMiddleware({
    name: 'IP Middleware',
    handler({ logger }) {
        return async (req, res, next) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            if (req.headers['cf-connecting-ip']) {
                req.headers['bcmsrip'] = req.headers['cf-connecting-ip'];
            } else if (req.headers['x-forwarded-for']) {
                req.headers.bcmsrip = req.headers['x-forwarded-for'] as string;
            } else {
                req.headers.bcmsrip = '__unknown';
            }
            let requestFrom = '_unknown';
            try {
                if (req.headers.authorization) {
                    if (req.headers.authorization.startsWith('Bearer ')) {
                        const tokenBody: JWTPayload<UserCustomPool> =
                            JSON.parse(
                                Buffer.from(
                                    req.headers.authorization.split('.')[1],
                                    'base64',
                                ).toString(),
                            );
                        requestFrom = `u_${tokenBody.userId}`;
                    } else if (
                        req.headers.authorization.startsWith('ApiKey ')
                    ) {
                        requestFrom = `a_${
                            req.headers.authorization
                                .split(' ')[1]
                                .split('.')[0]
                        }`;
                    }
                }
            } catch (error) {
                // Ignore
            }
            logger.info(
                '',
                `(${req.headers.bcmsrip}>${requestFrom}) ${req.method}: ${req.url}`,
            );
            next();
        };
    },
});
