import crypto from 'crypto';
import {
    createController,
    createControllerMethod,
    HttpStatus,
} from '@bcms/selfhosted-backend/_server';
import {
    AuthLoginBodySchema,
    type AuthLoginBody,
    type AuthLoginResponse,
    type AuthSignUpAdminBody,
} from '@bcms/selfhosted-backend/auth/models/controller';
import {
    RP,
    type RPBodyCheckResult,
} from '@bcms/selfhosted-backend/security/route-protection/main';
import { Repo } from '@bcms/selfhosted-backend/repo';
import bcrypt from 'bcryptjs';
import {
    JWTEncode,
    JWTError,
    JWTManager,
} from '@bcms/selfhosted-backend/_server/modules/jwt';
import type { UserCustomPool } from '@bcms/selfhosted-backend/user/models/custom-pool';
import { Config } from '@bcms/selfhosted-backend/config';
import { RefreshTokenService } from '@bcms/selfhosted-backend/auth/refresh-token-service';
import { openApiGetObjectRefSchema } from '@bcms/selfhosted-backend/open-api/schema';
import { UserFactory } from '@bcms/selfhosted-backend/user/factory';
import { LanguageFactory } from '@bcms/selfhosted-backend/language/factory';
import { EntryStatusFactory } from '@bcms/selfhosted-backend/entry-status/factory';

let createAdminServerToken: string | null = null;

export function setAuthCreateAdminServerToken(): string {
    createAdminServerToken = crypto
        .createHash('sha512')
        .update(crypto.randomBytes(16).toString('hex') + Date.now())
        .digest('hex');
    return createAdminServerToken;
}

export const AuthController = createController({
    path: '/api/v4/auth',
    name: 'Auth',
    methods({ controllerName }) {
        return {
            shouldSignUp: createControllerMethod<void, { yes: boolean }>({
                path: '/should-signup',
                type: 'get',
                openApi: {
                    tags: [controllerName],
                    summary:
                        'Check if user should be redirected to admin' +
                        ' sign up',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: openApiGetObjectRefSchema(
                                    'AuthLoginBody',
                                ),
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            yes: {
                                                type: 'boolean',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                async handler() {
                    return { yes: !!createAdminServerToken };
                },
            }),

            signUpAdmin: createControllerMethod<
                RPBodyCheckResult<AuthSignUpAdminBody>,
                AuthLoginResponse
            >({
                path: '/signup-admin',
                type: 'post',
                openApi: {
                    tags: [controllerName],
                    summary: 'Sign up admin user using server token',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: openApiGetObjectRefSchema(
                                    'AuthSignUpAdminBody',
                                ),
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: openApiGetObjectRefSchema(
                                        'AuthLoginResponse',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createBodyCheck(AuthLoginBodySchema),
                async handler({ body, errorHandler }) {
                    if (body.serverToken !== createAdminServerToken) {
                        throw errorHandler(
                            HttpStatus.Unauthorized,
                            'Invalid server token',
                        );
                    }
                    const user = await Repo.user.add(
                        UserFactory.create({
                            roles: [
                                {
                                    name: 'ADMIN',
                                    permissions: [],
                                },
                            ],
                            customPool: {
                                address: {},
                                personal: {
                                    firstName: body.firstName,
                                    lastName: body.lastName,
                                    avatarUri: '',
                                },
                                policy: {
                                    media: {
                                        get: false,
                                        delete: false,
                                        post: false,
                                        put: false,
                                    },
                                    templates: [],
                                },
                            },
                            password: await bcrypt.hash(body.password, 10),
                            email: body.email,
                            username: body.firstName + ' ' + body.lastName,
                        }),
                    );
                    if (!(await Repo.language.methods.findByCode('en'))) {
                        await Repo.language.add(
                            LanguageFactory.create({
                                name: 'English',
                                userId: 'admin',
                                code: 'en',
                                default: true,
                                nativeName: 'English',
                            }),
                        );
                    }
                    if ((await Repo.entryStatus.findAll()).length === 0) {
                        await Repo.entryStatus.add(
                            EntryStatusFactory.create({
                                label: 'Publised',
                                userId: 'admin',
                            }),
                        );
                        await Repo.entryStatus.add(
                            EntryStatusFactory.create({
                                label: 'Draft',
                                userId: 'admin',
                            }),
                        );
                    }
                    createAdminServerToken = null;
                    const accessToken = JWTManager.create<UserCustomPool>({
                        issuer: Config.jwtIssuer,
                        roles: user.roles.map((e) => e.name),
                        userId: user._id,
                        props: user.customPool,
                    });
                    if (accessToken instanceof JWTError) {
                        throw errorHandler(
                            HttpStatus.InternalServerError,
                            'Failed to create access token.',
                        );
                    }
                    const rt = RefreshTokenService.generate(user._id);
                    return {
                        accessToken: JWTEncode.encode(accessToken),
                        refreshToken: `${user._id}.${rt}`,
                    };
                },
            }),

            login: createControllerMethod<
                RPBodyCheckResult<AuthLoginBody>,
                AuthLoginResponse
            >({
                path: '/login',
                type: 'post',
                openApi: {
                    tags: [controllerName],
                    summary: 'Login with email and password',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: openApiGetObjectRefSchema(
                                    'AuthLoginBody',
                                ),
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: openApiGetObjectRefSchema(
                                        'AuthLoginResponse',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createBodyCheck(AuthLoginBodySchema),
                async handler({ body, errorHandler }) {
                    const user = await Repo.user.methods.findByEmail(
                        body.email,
                    );
                    if (!user) {
                        throw errorHandler(
                            HttpStatus.Unauthorized,
                            `Wrong email and/or password`,
                        );
                    }
                    if (!(await bcrypt.compare(body.password, user.password))) {
                        throw errorHandler(
                            HttpStatus.Unauthorized,
                            `Wrong email and/or password`,
                        );
                    }
                    const accessToken = JWTManager.create<UserCustomPool>({
                        issuer: Config.jwtIssuer,
                        roles: user.roles.map((e) => e.name),
                        userId: user._id,
                        props: user.customPool,
                    });
                    if (accessToken instanceof JWTError) {
                        throw errorHandler(
                            HttpStatus.InternalServerError,
                            'Failed to create access token.',
                        );
                    }
                    const rt = RefreshTokenService.generate(user._id);
                    return {
                        accessToken: JWTEncode.encode(accessToken),
                        refreshToken: `${user._id}.${rt}`,
                    };
                },
            }),

            logout: createControllerMethod<void, { ok: boolean }>({
                path: '/logout',
                type: 'post',
                openApi: {
                    tags: [controllerName],
                    summary: 'Invalidate Access and Refresh token pair',
                    parameters: [
                        {
                            in: 'header',
                            name: 'Authorization',
                            required: true,
                            schema: {
                                type: 'string',
                                format: 'Bearer <REFRESH_TOKEN>',
                            },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        required: ['ok'],
                                        properties: {
                                            ok: {
                                                type: 'boolean',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                async handler({ request }) {
                    const header = request.headers.authorization + '';
                    const rtParts = header.replace('Bearer ', '').split('.');
                    if (rtParts.length !== 2) {
                        return { ok: true };
                    }
                    await RefreshTokenService.remove(rtParts[0], rtParts[1]);
                    return { ok: true };
                },
            }),

            refreshAccess: createControllerMethod<
                void,
                { accessToken: string }
            >({
                path: '/refresh-access',
                type: 'post',
                openApi: {
                    tags: [controllerName],
                    summary: 'Get a new valid Access token',
                    parameters: [
                        {
                            in: 'header',
                            name: 'Authorization',
                            required: true,
                            schema: {
                                type: 'string',
                                format: 'Bearer <REFRESH_TOKEN>',
                            },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        required: ['token'],
                                        properties: {
                                            accessToken: {
                                                type: 'string',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                async handler({ errorHandler, request }) {
                    const header = request.headers.authorization + '';
                    const rtParts = header.replace('Bearer ', '').split('.');
                    if (rtParts.length !== 2) {
                        throw errorHandler(
                            HttpStatus.Forbidden,
                            'Invalid refresh token format',
                        );
                    }
                    const user = await Repo.user.findById(rtParts[0]);
                    if (!user) {
                        throw errorHandler(
                            HttpStatus.InternalServerError,
                            `User with ID "${rtParts[0]}" does not exist`,
                        );
                    }
                    const accessToken = JWTManager.create<UserCustomPool>({
                        issuer: Config.jwtIssuer,
                        roles: user.roles.map((e) => e.name),
                        userId: user._id,
                        props: user.customPool,
                    });
                    if (accessToken instanceof JWTError) {
                        throw errorHandler(
                            HttpStatus.InternalServerError,
                            'Failed to create access token.',
                        );
                    }
                    return { accessToken: JWTEncode.encode(accessToken) };
                },
            }),
        };
    },
});
