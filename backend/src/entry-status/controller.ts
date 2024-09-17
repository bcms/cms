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
import type { EntryStatus } from '@bcms/selfhosted-backend/entry-status/models/main';
import {
    controllerItemResponseDefinitionForRef,
    controllerItemsResponseDefinitionForRef,
    openApiGetModelRef,
} from '@bcms/selfhosted-backend/open-api/schema';
import { Repo } from '@bcms/selfhosted-backend/repo';
import {
    type EntryStatusCreateBody,
    EntryStatusCreateBodySchema,
    type EntryStatusUpdateBody,
    EntryStatusUpdateBodySchema,
} from '@bcms/selfhosted-backend/entry-status/models/controller';
import { EntryStatusFactory } from '@bcms/selfhosted-backend/entry-status/factory';
import { SocketManager } from '@bcms/selfhosted-backend/socket/manager';
import { EventManager } from '@bcms/selfhosted-backend/event/manager';

export const EntryStatusController = createController({
    name: 'EntryStatus',
    path: '/api/v4/entry-status',
    methods({ controllerName }) {
        return {
            getAll: createControllerMethod<
                RPApiKeyJwtCheckResult,
                ControllerItemsResponse<EntryStatus>
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
                    summary: 'Get all entry statuses for specified instance',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemsResponseDefinitionForRef(
                                        'EntryStatus',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(),
                async handler() {
                    const items = await Repo.entryStatus.findAll();
                    return {
                        items,
                        total: items.length,
                        limit: items.length,
                        offset: 0,
                    };
                },
            }),

            getById: createControllerMethod<
                RPApiKeyJwtCheckResult,
                ControllerItemResponse<EntryStatus>
            >({
                path: '/:entryStatusId',
                type: 'get',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    parameters: [
                        {
                            in: 'path',
                            name: 'entryStatusId',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    summary: 'Get specified entry status by its ID',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemResponseDefinitionForRef(
                                        'EntryStatus',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(),
                async handler({ request, errorHandler }) {
                    const params = request.params as {
                        entryStatusId: string;
                    };
                    const entryStatus = await Repo.entryStatus.findById(
                        params.entryStatusId,
                    );
                    if (!entryStatus) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Entry status with ID "${params.entryStatusId}" does not exist`,
                        );
                    }
                    return {
                        item: entryStatus,
                    };
                },
            }),

            create: createControllerMethod<
                RPJwtBodyCheckResult<EntryStatusCreateBody>,
                ControllerItemResponse<EntryStatus>
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
                    summary: 'Create new entry status in specified instance',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: openApiGetModelRef(
                                        'EntryStatusCreateBody',
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
                                        'EntryStatus',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtBodyCheck(
                    EntryStatusCreateBodySchema,
                    ['ADMIN'],
                ),
                async handler({ body, token }) {
                    const entryStatus = await Repo.entryStatus.add(
                        EntryStatusFactory.create({
                            label: body.label,
                            userId: token.payload.userId,
                        }),
                    );
                    SocketManager.channelEmit(
                        ['global'],
                        'entry_status',
                        {
                            type: 'update',
                            entryStatusId: entryStatus._id,
                        },
                        [token.payload.userId],
                    );
                    EventManager.trigger(
                        'add',
                        'entryStatus',
                        entryStatus,
                    ).catch((err) => console.error(err));
                    return {
                        item: entryStatus,
                    };
                },
            }),

            update: createControllerMethod<
                RPJwtBodyCheckResult<EntryStatusUpdateBody>,
                ControllerItemResponse<EntryStatus>
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
                    summary: 'Update existing entry status information',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: openApiGetModelRef(
                                        'EntryStatusUpdateBody',
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
                                        'EntryStatus',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtBodyCheck(
                    EntryStatusUpdateBodySchema,
                    ['ADMIN'],
                ),
                async handler({ body, errorHandler, token }) {
                    let entryStatus = await Repo.entryStatus.findById(body._id);
                    if (!entryStatus) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Entry status with ID "${body._id}" does not exist`,
                        );
                    }
                    let shouldUpdate = false;
                    if (body.label && body.label !== entryStatus.label) {
                        shouldUpdate = true;
                        entryStatus.label = body.label;
                    }
                    if (shouldUpdate) {
                        entryStatus = await Repo.entryStatus.update(
                            entryStatus,
                        );
                        SocketManager.channelEmit(
                            ['global'],
                            'entry_status',
                            {
                                type: 'update',
                                entryStatusId: entryStatus.userId,
                            },
                            [token.payload.userId],
                        );
                        EventManager.trigger(
                            'update',
                            'entryStatus',
                            entryStatus,
                        ).catch((err) => console.error(err));
                    }
                    return {
                        item: entryStatus,
                    };
                },
            }),

            deleteById: createControllerMethod<
                RPJwtCheckResult,
                ControllerItemResponse<EntryStatus>
            >({
                path: '/:entryStatusId',
                type: 'delete',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    parameters: [
                        {
                            in: 'path',
                            name: 'entryStatusId',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    summary: 'Delete entry status by its ID',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemResponseDefinitionForRef(
                                        'EntryStatus',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(['ADMIN']),
                async handler({ request, errorHandler, token }) {
                    const params = request.params as {
                        entryStatusId: string;
                    };
                    const entryStatus = await Repo.entryStatus.findById(
                        params.entryStatusId,
                    );
                    if (!entryStatus) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Entry status with ID "${params.entryStatusId}" does not exist`,
                        );
                    }
                    await Repo.entryStatus.deleteById(entryStatus._id);
                    SocketManager.channelEmit(
                        ['global'],
                        'entry_status',
                        {
                            type: 'delete',
                            entryStatusId: params.entryStatusId,
                        },
                        [token.payload.userId],
                    );
                    EventManager.trigger(
                        'delete',
                        'entryStatus',
                        entryStatus,
                    ).catch((err) => console.error(err));
                    return {
                        item: entryStatus,
                    };
                },
            }),
        };
    },
});
