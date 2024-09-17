import * as crypto from 'crypto';
import {
    createController,
    createControllerMethod,
    HttpStatus,
} from '@bcms/selfhosted-backend/_server';
import {
    RP,
    type RPApiKeyJwtCheckResult,
    type RPJwtBodyCheckResult,
    type RPJwtCheckResult,
} from '@bcms/selfhosted-backend/security/route-protection/main';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';
import type { ApiKey } from '@bcms/selfhosted-backend/api-key/models/main';
import {
    controllerItemResponseDefinitionForRef,
    controllerItemsResponseDefinitionForRef,
    openApiGetModelRef,
} from '@bcms/selfhosted-backend/open-api/schema';
import { Repo } from '@bcms/selfhosted-backend/repo';
import {
    type ApiKeyCreateBody,
    ApiKeyCreateBodySchema,
    type ApiKeyUpdateBody,
    ApiKeyUpdateBodySchema,
} from '@bcms/selfhosted-backend/api-key/models/controller';
import { ApiKeyFactory } from '@bcms/selfhosted-backend/api-key/factory';
import { SocketManager } from '@bcms/selfhosted-backend/socket/manager';
import { FunctionManager } from '@bcms/selfhosted-backend/function/main';
import { EventManager } from '@bcms/selfhosted-backend/event/manager';

export const ApiKeyController = createController({
    name: 'ApiKey',
    path: '/api/v4/api-key',
    methods({ controllerName }) {
        return {
            getAll: createControllerMethod<
                RPJwtCheckResult,
                ControllerItemsResponse<ApiKey>
            >({
                path: '/all',
                type: 'get',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Get all api keys for specified instance',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemsResponseDefinitionForRef(
                                        'ApiKey',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(['ADMIN']),
                async handler() {
                    const apiKeys = await Repo.apiKey.findAll();
                    return {
                        items: apiKeys,
                        total: apiKeys.length,
                        limit: apiKeys.length,
                        offset: 0,
                    };
                },
            }),

            getById: createControllerMethod<
                RPApiKeyJwtCheckResult,
                ControllerItemResponse<ApiKey>
            >({
                path: '/:apiKeyId',
                type: 'get',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Get all api keys for specified instance',
                    parameters: [
                        {
                            in: 'path',
                            name: 'apiKeyId',
                            schema: {
                                type: 'string',
                            },
                            required: true,
                        },
                    ],
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemResponseDefinitionForRef(
                                        'ApiKey',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(['ADMIN']),
                async handler({ request, errorHandler, token, apiKey }) {
                    const params = request.params as {
                        apiKeyId: string;
                    };
                    let item: ApiKey | null = null;
                    if (token) {
                        item = await Repo.apiKey.findById(params.apiKeyId);
                    } else if (apiKey) {
                        return { item: apiKey };
                    }
                    if (!item) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Api key with ID "${params.apiKeyId}" does not exist`,
                        );
                    }
                    return { item };
                },
            }),

            create: createControllerMethod<
                RPJwtBodyCheckResult<ApiKeyCreateBody>,
                ControllerItemResponse<ApiKey>
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
                    summary: 'Create new api key',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: openApiGetModelRef(
                                        'ApiKeyCreateBody',
                                    ),
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
                                        'ApiKey',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtBodyCheck(
                    ApiKeyCreateBodySchema,
                    ['ADMIN'],
                ),
                async handler({ body, token }) {
                    const apiKey = ApiKeyFactory.create({
                        userId: token.payload.userId,
                        name: body.name,
                        desc: body.desc,
                        blocked: false,
                        secret: crypto
                            .createHash('sha256')
                            .update(
                                Date.now() +
                                    crypto.randomBytes(16).toString('hex'),
                            )
                            .digest('hex'),
                        access: {
                            functions: [],
                            templates: [],
                        },
                    });
                    EventManager.trigger('add', 'apiKey', apiKey).catch((err) =>
                        console.error(err),
                    );
                    return { item: await Repo.apiKey.add(apiKey) };
                },
            }),

            update: createControllerMethod<
                RPJwtBodyCheckResult<ApiKeyUpdateBody>,
                ControllerItemResponse<ApiKey>
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
                    summary: 'Update an existing api key',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: openApiGetModelRef(
                                        'ApiKeyUpdateBody',
                                    ),
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
                                        'ApiKey',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtBodyCheck(
                    ApiKeyUpdateBodySchema,
                    ['ADMIN'],
                ),
                async handler({ body, errorHandler, token }) {
                    let apiKey = await Repo.apiKey.findById(body._id);
                    if (!apiKey) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Api key with ID "${body._id}" does not exist`,
                        );
                    }
                    let shouldUpdate = false;
                    if (body.name && body.name !== apiKey.name) {
                        shouldUpdate = true;
                        apiKey.name = body.name;
                    }
                    if (body.desc && body.desc !== apiKey.desc) {
                        shouldUpdate = true;
                        apiKey.desc = body.desc;
                    }
                    if (
                        typeof body.blocked === 'boolean' &&
                        body.blocked !== apiKey.blocked
                    ) {
                        shouldUpdate = true;
                        apiKey.blocked = body.blocked;
                    }
                    if (
                        body.access &&
                        JSON.stringify(body.access) &&
                        JSON.stringify(apiKey.access)
                    ) {
                        shouldUpdate = true;
                        apiKey.access = {
                            functions: [],
                            templates: [],
                        };
                        const templates = await Repo.template.findAll();
                        for (let i = 0; i < body.access.templates.length; i++) {
                            const templateInfo = body.access.templates[i];
                            const template = templates.find(
                                (e) => e._id === templateInfo._id,
                            );
                            if (template) {
                                apiKey.access.templates.push(templateInfo);
                            }
                        }
                        const fns = FunctionManager.getAll();
                        const fnsInfo = body.access.functions;
                        for (let i = 0; i < fnsInfo.length; i++) {
                            const fnInfo = fnsInfo[i];
                            const fn = fns.find(
                                (e) => e.config.name === fnInfo.name,
                            );
                            if (fn) {
                                apiKey.access.functions.push({
                                    name: fn.config.name,
                                });
                            }
                        }
                    }
                    if (shouldUpdate) {
                        apiKey = await Repo.apiKey.update(apiKey);
                        SocketManager.channelEmit(
                            ['global'],
                            'api_key',
                            {
                                type: 'update',
                                apiKey: apiKey._id,
                            },
                            [token.payload.userId],
                        );
                        EventManager.trigger('update', 'apiKey', apiKey).catch(
                            (err) => console.error(err),
                        );
                    }
                    return { item: apiKey };
                },
            }),

            deleteById: createControllerMethod<
                RPJwtCheckResult,
                ControllerItemResponse<ApiKey>
            >({
                path: '/:apiKeyId',
                type: 'delete',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Delete api key by its ID',
                    parameters: [
                        {
                            in: 'path',
                            name: 'apiKeyId',
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
                                        'ApiKey',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(['ADMIN']),
                async handler({ request, token, errorHandler }) {
                    const params = request.params as {
                        orgId: string;
                        instanceId: string;
                        apiKeyId: string;
                    };
                    const apiKey = await Repo.apiKey.findById(params.apiKeyId);
                    if (!apiKey) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Api key with ID "${params.apiKeyId}" does not exist`,
                        );
                    }
                    await Repo.apiKey.deleteById(apiKey._id);
                    SocketManager.channelEmit(
                        ['global'],
                        'api_key',
                        {
                            type: 'delete',
                            apiKey: apiKey._id,
                        },
                        [token.payload.userId],
                    );
                    EventManager.trigger('delete', 'apiKey', apiKey).catch(
                        (err) => console.error(err),
                    );
                    return { item: apiKey };
                },
            }),
        };
    },
});
