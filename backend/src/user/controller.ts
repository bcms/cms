import bcrypt from 'bcryptjs';
import {
    createController,
    createControllerMethod,
    HttpStatus,
} from '@thebcms/selfhosted-backend/server';
import {
    RP,
    type RPJwtBodyCheckResult,
    type RPJwtCheckResult,
} from '@thebcms/selfhosted-backend/security/route-protection/main';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@thebcms/selfhosted-backend/util/controller';
import { Repo } from '@thebcms/selfhosted-backend/repo';
import { UserFactory } from '@thebcms/selfhosted-backend/user/factory';
import {
    controllerItemResponseDefinitionForRef,
    controllerItemsResponseDefinitionForRef,
    openApiGetObjectRefSchema,
} from '@thebcms/selfhosted-backend/open-api/schema';
import { Storage } from '@thebcms/selfhosted-backend/storage/main';
import type { UserProtected } from '@thebcms/selfhosted-backend/user/models/main';
import {
    type UserCreateBody,
    UserCreateBodySchema,
    type UserStatsResponse,
    type UserUpdateBody,
    UserUpdateBodySchema,
} from '@thebcms/selfhosted-backend/user/models/controller';
import { SocketManager } from '@thebcms/selfhosted-backend/socket/manager';

export const UserController = createController({
    name: 'User',
    path: '/api/v4/user',
    methods({ controllerName }) {
        return {
            getStats: createControllerMethod<
                RPJwtCheckResult,
                UserStatsResponse
            >({
                path: '/stats',
                type: 'get',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                            apiKey: [],
                        },
                    ],
                    summary: 'Get user stats',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemsResponseDefinitionForRef(
                                        'UserStatsResponse',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(),
                async handler({ token }) {
                    const media = (await Repo.media.findAll()).filter(
                        (e) => e.userId === token.payload.userId,
                    );
                    return {
                        entryCount: (await Repo.entry.findAll()).filter(
                            (e) => e.userId === token.payload.userId,
                        ).length,
                        mediaCount: media.length,
                        mediaSize: media.reduce((prev, curr) => {
                            return prev + curr.size;
                        }, 0),
                        userCount: (await Repo.user.findAll()).length,
                    };
                },
            }),

            getAll: createControllerMethod<
                RPJwtCheckResult,
                ControllerItemsResponse<UserProtected>
            >({
                path: '/all',
                type: 'get',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                            apiKey: [],
                        },
                    ],
                    summary: 'Get all users',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemsResponseDefinitionForRef(
                                        'UserProtected',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(),
                async handler() {
                    const items = (await Repo.user.findAll()).map((e) =>
                        UserFactory.toProtected(e),
                    );
                    return {
                        items,
                        total: items.length,
                        limit: items.length,
                        offset: 0,
                    };
                },
            }),

            getById: createControllerMethod<
                RPJwtCheckResult,
                ControllerItemResponse<UserProtected>
            >({
                path: '/:userId',
                type: 'get',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Get user by its ID',
                    parameters: [
                        {
                            in: 'path',
                            name: 'userId',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemResponseDefinitionForRef(
                                        'UserProtected',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(),
                async handler({ request, errorHandler }) {
                    const params = request.params as {
                        userId: string;
                    };
                    const user = await Repo.user.findById(params.userId);
                    if (!user) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `User with ID "${params.userId}" does not exist`,
                        );
                    }
                    return {
                        item: user,
                    };
                },
            }),

            create: createControllerMethod<
                RPJwtBodyCheckResult<UserCreateBody>,
                ControllerItemResponse<UserProtected>
            >({
                path: '/create',
                type: 'post',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Create a new user',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: openApiGetObjectRefSchema(
                                    'UserCreateBody',
                                ),
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemResponseDefinitionForRef(
                                        'UserProtected',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtBodyCheck(UserCreateBodySchema, [
                    'ADMIN',
                ]),
                async handler({ body, token, errorHandler }) {
                    let user = UserFactory.create({
                        email: body.email,
                        username: body.firstName + ' ' + body.lastName,
                        roles: [
                            {
                                name: body.role,
                                permissions: [],
                            },
                        ],
                        password: await bcrypt.hash(body.password, 10),
                        customPool: {
                            personal: {
                                lastName: body.lastName,
                                firstName: body.firstName,
                                avatarUri: '',
                            },
                            address: {},
                            policy: {
                                media: {
                                    delete: false,
                                    get: false,
                                    post: false,
                                    put: false,
                                },
                                plugins: [],
                                templates: [],
                            },
                        },
                    });
                    if (await Repo.user.methods.findByEmail(body.email)) {
                        throw errorHandler(
                            HttpStatus.Forbidden,
                            `User with email "${body.email}" already exists`,
                        );
                    }
                    user = await Repo.user.add(user);
                    SocketManager.channelEmit(
                        ['user'],
                        'user',
                        {
                            userId: user._id,
                            type: 'update',
                        },
                        [token.payload.userId],
                    );
                    return {
                        item: user,
                    };
                },
            }),

            update: createControllerMethod<
                RPJwtBodyCheckResult<UserUpdateBody>,
                ControllerItemResponse<UserProtected>
            >({
                path: '/update',
                type: 'put',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Update user information',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: openApiGetObjectRefSchema(
                                    'UserUpdateBody',
                                ),
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemResponseDefinitionForRef(
                                        'UserProtected',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtBodyCheck(UserUpdateBodySchema, [
                    'ADMIN',
                ]),
                async handler({ body, token, errorHandler }) {
                    let user = await Repo.user.findById(body._id);
                    if (!user) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `User with ID "${body._id}" does not exist`,
                        );
                    }
                    let shouldUpdate = false;
                    if (body.role && body.role !== user.roles[0].name) {
                        if (token.payload.userId === body._id) {
                            throw errorHandler(
                                HttpStatus.Forbidden,
                                'You cannot change your role. Ask other admin to do that for you',
                            );
                        }
                        if (!['ADMIN', 'USER'].includes(body.role)) {
                            throw errorHandler(
                                HttpStatus.BadRequest,
                                `Role name "${body.role}" is not allowed`,
                            );
                        }
                        shouldUpdate = true;
                        user.roles[0].name = body.role;
                    }
                    if (body.password && body.password.length > 8) {
                        shouldUpdate = true;
                        user.password = await bcrypt.hash(body.password, 10);
                    }
                    if (body.email && body.email !== user.email) {
                        if (await Repo.user.methods.findByEmail(body.email)) {
                            throw errorHandler(
                                HttpStatus.BadRequest,
                                `Email "${body.email}" is already used by a different user`,
                            );
                        }
                        shouldUpdate = true;
                        user.email = body.email;
                    }
                    if (body.customPool) {
                        if (body.customPool.personal) {
                            if (
                                body.customPool.personal.firstName &&
                                body.customPool.personal.firstName !==
                                    user.customPool.personal.firstName
                            ) {
                                shouldUpdate = true;
                                user.customPool.personal.firstName =
                                    body.customPool.personal.firstName;
                            }
                            if (
                                body.customPool.personal.lastName &&
                                body.customPool.personal.lastName !==
                                    user.customPool.personal.lastName
                            ) {
                                shouldUpdate = true;
                                user.customPool.personal.lastName =
                                    body.customPool.personal.lastName;
                            }
                        }
                        if (body.customPool.policy) {
                            if (body.customPool.policy.media) {
                                shouldUpdate = true;
                                user.customPool.policy.media =
                                    body.customPool.policy.media;
                            }
                            if (body.customPool.policy.plugins) {
                                shouldUpdate = true;
                                user.customPool.policy.plugins =
                                    body.customPool.policy.plugins;
                            }
                            if (body.customPool.policy.templates) {
                                shouldUpdate = true;
                                user.customPool.policy.templates =
                                    body.customPool.policy.templates;
                            }
                        }
                    }
                    if (shouldUpdate) {
                        user = await Repo.user.update(user);
                        SocketManager.channelEmit(
                            ['user'],
                            'user',
                            {
                                userId: user._id,
                                type: 'update',
                            },
                            [token.payload.userId],
                        );
                    }
                    return { item: user };
                },
            }),

            uploadAvatar: createControllerMethod<
                RPJwtCheckResult,
                ControllerItemResponse<UserProtected>
            >({
                path: '/:userId/avatar',
                type: 'post',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Upload user avatar',
                    parameters: [
                        {
                            in: 'path',
                            name: 'userId',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    requestBody: {
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    required: ['file'],
                                    properties: {
                                        file: {
                                            type: 'string',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemResponseDefinitionForRef(
                                        'UserProtected',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(['ADMIN']),
                async handler({ request, token, errorHandler }) {
                    const params = request.params as {
                        userId: string;
                    };
                    const data = await request.file({
                        limits: {
                            fileSize: 10 * 1024 * 1024,
                        },
                    });
                    if (!data) {
                        throw errorHandler(
                            HttpStatus.BadRequest,
                            'Missing an image.',
                        );
                    }
                    if (!data.mimetype.startsWith('image/')) {
                        throw errorHandler(
                            HttpStatus.BadRequest,
                            'File must be an image.',
                        );
                    }
                    let user = await Repo.user.findById(params.userId);
                    if (!user) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `User with ID "${token.payload.userId}" does not exist`,
                        );
                    }
                    const ext = data.mimetype.split('/')[1];
                    try {
                        const buffer = await data.toBuffer();
                        user.customPool.personal.avatarUri = (
                            await Storage.save(
                                user._id + '.' + ext,
                                'user-avatar',
                                data.mimetype,
                                buffer,
                            )
                        ).uri;
                    } catch (error) {
                        const err = error as Error;
                        throw errorHandler(HttpStatus.BadRequest, err.message);
                    }
                    user = await Repo.user.update(user);
                    SocketManager.channelEmit(
                        ['user'],
                        'user',
                        {
                            userId: user._id,
                            type: 'update',
                        },
                        [token.payload.userId],
                    );
                    return {
                        item: UserFactory.toProtected(user),
                    };
                },
            }),

            deleteById: createControllerMethod<
                RPJwtCheckResult,
                ControllerItemResponse<UserProtected>
            >({
                path: '/:userId',
                type: 'delete',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Delete user by ID',
                    parameters: [
                        {
                            in: 'path',
                            name: 'userId',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemResponseDefinitionForRef(
                                        'UserProtected',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(['ADMIN']),
                async handler({ request, token, errorHandler }) {
                    const params = request.params as {
                        userId: string;
                    };
                    if (token.payload.userId === params.userId) {
                        throw errorHandler(
                            HttpStatus.Forbidden,
                            'You are not allowed to delete yourself',
                        );
                    }
                    const user = await Repo.user.findById(params.userId);
                    if (!user) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `User with ID "${params.userId}" does not exist`,
                        );
                    }
                    await Repo.user.deleteById(user._id);
                    SocketManager.channelEmit(
                        ['user'],
                        'user',
                        {
                            userId: user._id,
                            type: 'delete',
                        },
                        [token.payload.userId],
                    );
                    return { item: user };
                },
            }),
        };
    },
});
