import {
    createController,
    createControllerMethod,
    HttpStatus,
} from '@bcms/selfhosted-backend/_server';
import {
    RP,
    type RPJwtBodyCheckResult,
    type RPJwtCheckResult,
} from '@bcms/selfhosted-backend/security/route-protection/main';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';
import type { TemplateOrganizer } from '@bcms/selfhosted-backend/template-organizer/models/main';
import {
    controllerItemResponseDefinitionForRef,
    controllerItemsResponseDefinitionForRef,
    openApiGetModelRef,
} from '@bcms/selfhosted-backend/open-api/schema';
import { Repo } from '@bcms/selfhosted-backend/repo';
import {
    type TemplateOrganizerCreateBody,
    TemplateOrganizerCreateBodySchema,
    type TemplateOrganizerUpdateBody,
    TemplateOrganizerUpdateBodySchema,
} from '@bcms/selfhosted-backend/template-organizer/models/controller';
import { TemplateOrganizerFactory } from '@bcms/selfhosted-backend/template-organizer/factory';
import { StringUtility } from '@bcms/selfhosted-utils/string-utility';
import { SocketManager } from '@bcms/selfhosted-backend/socket/manager';
import { EventManager } from '@bcms/selfhosted-backend/event/manager';

export const TemplateOrganizerController = createController({
    name: 'TemplateOrganizer',
    path: '/api/v4/template-organizer',
    methods({ controllerName }) {
        return {
            getAll: createControllerMethod<
                RPJwtCheckResult,
                ControllerItemsResponse<TemplateOrganizer>
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
                    summary: 'Get all template organizers',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemsResponseDefinitionForRef(
                                        'TemplateOrganizer',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(),
                async handler() {
                    const items = await Repo.templateOrganizer.findAll();
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
                ControllerItemResponse<TemplateOrganizer>
            >({
                path: '/:templateOrganizerId',
                type: 'get',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Get template organizer by its ID',
                    parameters: [
                        {
                            in: 'path',
                            name: 'templateOrganizerId',
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
                                        'TemplateOrganizer',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(),
                async handler({ request, errorHandler }) {
                    const params = request.params as {
                        templateOrganizerId: string;
                    };
                    const templateOrganizer =
                        await Repo.templateOrganizer.findById(
                            params.templateOrganizerId,
                        );
                    if (!templateOrganizer) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Template organizer with ID "${params.templateOrganizerId}" does not exist`,
                        );
                    }
                    return {
                        item: templateOrganizer,
                    };
                },
            }),

            create: createControllerMethod<
                RPJwtBodyCheckResult<TemplateOrganizerCreateBody>,
                ControllerItemResponse<TemplateOrganizer>
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
                    summary: 'Create new template organizer',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: openApiGetModelRef(
                                        'TemplateOrganizerCreateBody',
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
                                        'Template',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtBodyCheck(
                    TemplateOrganizerCreateBodySchema,
                    ['ADMIN'],
                ),
                async handler({ body, token }) {
                    let templateOrganizer = TemplateOrganizerFactory.create({
                        label: body.label,
                        name: StringUtility.toSlug(body.label),
                        templateIds: body.templateIds,
                    });
                    templateOrganizer = await Repo.templateOrganizer.add(
                        templateOrganizer,
                    );
                    SocketManager.channelEmit(
                        ['global'],
                        'template_organizer',
                        {
                            type: 'update',
                            templateOrganizerId: templateOrganizer._id,
                        },
                        token ? [token.payload.userId] : undefined,
                    );
                    EventManager.trigger(
                        'add',
                        'templateOrganizer',
                        templateOrganizer,
                    ).catch((err) => console.error(err));
                    return {
                        item: templateOrganizer,
                    };
                },
            }),

            update: createControllerMethod<
                RPJwtBodyCheckResult<TemplateOrganizerUpdateBody>,
                ControllerItemResponse<TemplateOrganizer>
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
                    summary: 'Update existing template organizer',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: openApiGetModelRef(
                                        'TemplateOrganizerUpdateBody',
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
                                        'TemplateOrganizer',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtBodyCheck(
                    TemplateOrganizerUpdateBodySchema,
                    ['ADMIN'],
                ),
                async handler({ body, errorHandler, token }) {
                    let templateOrganizer =
                        await Repo.templateOrganizer.findById(body._id);
                    if (!templateOrganizer) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Template organizer with ID "${body._id}" does not exist`,
                        );
                    }
                    let shouldUpdate = false;
                    if (body.label && body.label !== templateOrganizer.label) {
                        shouldUpdate = true;
                        templateOrganizer.label = body.label;
                        templateOrganizer.name = StringUtility.toSlug(
                            body.label,
                        );
                    }
                    if (body.templateIds) {
                        shouldUpdate = true;
                        templateOrganizer.templateIds = body.templateIds;
                    }
                    if (shouldUpdate) {
                        templateOrganizer = await Repo.templateOrganizer.update(
                            templateOrganizer,
                        );
                        SocketManager.channelEmit(
                            ['global'],
                            'template_organizer',
                            {
                                type: 'update',
                                templateOrganizerId: templateOrganizer._id,
                            },
                            [token.payload.userId],
                        );
                        EventManager.trigger(
                            'update',
                            'templateOrganizer',
                            templateOrganizer,
                        ).catch((err) => console.error(err));
                    }
                    return {
                        item: templateOrganizer,
                    };
                },
            }),

            deleteById: createControllerMethod<
                RPJwtCheckResult,
                ControllerItemResponse<TemplateOrganizer>
            >({
                path: '/:templateOrganizerId',
                type: 'delete',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Delete template organizer by its ID',
                    parameters: [
                        {
                            in: 'path',
                            name: 'templateOrganizerId',
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
                                        'TemplateOrganizer',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(['ADMIN']),
                async handler({ request, errorHandler, token }) {
                    const params = request.params as {
                        templateOrganizerId: string;
                    };
                    const templateOrganizer =
                        await Repo.templateOrganizer.findById(
                            params.templateOrganizerId,
                        );
                    if (!templateOrganizer) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Template organizer with ID "${params.templateOrganizerId}" does not exist`,
                        );
                    }
                    await Repo.templateOrganizer.deleteById(
                        templateOrganizer._id,
                    );
                    SocketManager.channelEmit(
                        ['global'],
                        'template_organizer',
                        {
                            type: 'update',
                            templateOrganizerId: templateOrganizer._id,
                        },
                        [token.payload.userId],
                    );
                    EventManager.trigger(
                        'delete',
                        'templateOrganizer',
                        templateOrganizer,
                    ).catch((err) => console.error(err));
                    return {
                        item: templateOrganizer,
                    };
                },
            }),
        };
    },
});
