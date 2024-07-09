import {
    createController,
    createControllerMethod,
    HttpStatus,
} from '@thebcms/selfhosted-backend/server';
import {
    RP,
    type RPApiKeyJwtCheckResult,
    type RPJwtBodyCheckResult,
    type RPJwtCheckResult,
} from '@thebcms/selfhosted-backend/security/route-protection/main';
import {
    type WidgetCreateBody,
    WidgetCreateBodySchema,
    type WidgetUpdateBody,
    WidgetUpdateBodySchema,
    type WidgetWhereIsItUsedResult,
} from '@thebcms/selfhosted-backend/widget/models/controller';
import {
    controllerItemResponseDefinitionForRef,
    controllerItemsResponseDefinitionForRef,
    openApiGetModelRef,
} from '@thebcms/selfhosted-backend/open-api/schema';
import { Repo } from '@thebcms/selfhosted-backend/repo';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@thebcms/selfhosted-backend/util/controller';
import type { Widget } from '@thebcms/selfhosted-backend/widget/models/main';
import { WidgetFactory } from '@thebcms/selfhosted-backend/widget/factory';
import { StringUtility } from '@thebcms/selfhosted-backend/_utils/string-utility';
import { SocketManager } from '@thebcms/selfhosted-backend/socket/manager';
import { propsApplyChanges } from '@thebcms/selfhosted-backend/prop/changes';

export const WidgetController = createController({
    name: 'Widget',
    path: '/api/v4/widget',
    methods({ controllerName }) {
        return {
            whereIsItUsed: createControllerMethod<
                RPApiKeyJwtCheckResult,
                WidgetWhereIsItUsedResult
            >({
                path: '/:widgetId/where-is-it-used',
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
                            name: 'widgetId',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    summary:
                        'Get information on where specified widget is used.',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: openApiGetModelRef(
                                            'WidgetWhereIsItUsedResult',
                                        ),
                                    },
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(),
                async handler({ request }) {
                    const params = request.params as {
                        widgetId: string;
                        instanceId: string;
                        orgId: string;
                    };
                    return {
                        entryIds: (
                            await Repo.entry.methods.findAllByWidgetId(
                                params.widgetId,
                            )
                        ).map((e) => e._id),
                    };
                },
            }),

            getAll: createControllerMethod<
                RPApiKeyJwtCheckResult,
                ControllerItemsResponse<Widget>
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
                    summary: 'Get all widgets for specified instance',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemsResponseDefinitionForRef(
                                        'Widget',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(),
                async handler() {
                    const items = await Repo.widget.findAll();
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
                ControllerItemResponse<Widget>
            >({
                path: '/:widgetId',
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
                            name: 'widgetId',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    summary: 'Get specified widget by its ID',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemResponseDefinitionForRef(
                                        'Widget',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(),
                async handler({ request, errorHandler }) {
                    const params = request.params as {
                        widgetId: string;
                    };
                    const widget = await Repo.widget.findById(params.widgetId);
                    if (!widget) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Widget with ID "${params.widgetId}" does not exist`,
                        );
                    }
                    return {
                        item: widget,
                    };
                },
            }),

            create: createControllerMethod<
                RPJwtBodyCheckResult<WidgetCreateBody>,
                ControllerItemResponse<Widget>
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
                    summary: 'Create new widget in specified instance',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: openApiGetModelRef(
                                        'WidgetCreateBody',
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
                                        'Widget',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtBodyCheck(
                    WidgetCreateBodySchema,
                    ['ADMIN'],
                ),
                async handler({ body, errorHandler, token }) {
                    let widget = WidgetFactory.create({
                        previewImage: '',
                        label: body.label,
                        desc: body.desc,
                        props: [],
                        name: StringUtility.toSlug(body.label),
                        userId: token.payload.userId,
                    });
                    if (await Repo.widget.methods.findByName(widget.name)) {
                        throw errorHandler(
                            HttpStatus.BadRequest,
                            `Widget with name "${widget.name}" already exist. Widget name must be unique.`,
                        );
                    }
                    widget = await Repo.widget.add(widget);
                    SocketManager.channelEmit(
                        ['global'],
                        'widget',
                        {
                            type: 'update',
                            widgetId: widget._id,
                        },
                        [token.payload.userId],
                    );
                    return {
                        item: widget,
                    };
                },
            }),

            update: createControllerMethod<
                RPJwtBodyCheckResult<WidgetUpdateBody>,
                ControllerItemResponse<Widget>
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
                    summary: 'Update existing widget information',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: openApiGetModelRef(
                                        'WidgetUpdateBody',
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
                                        'Widget',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtBodyCheck(
                    WidgetUpdateBodySchema,
                    ['ADMIN'],
                ),
                async handler({ body, errorHandler, token }) {
                    let widget = await Repo.widget.findById(body._id);
                    if (!widget) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Widget with ID "${body._id}" does not exist`,
                        );
                    }
                    let shouldUpdate = false;
                    if (body.label && body.label !== widget.label) {
                        const newName = StringUtility.toSlug(body.label);
                        if (await Repo.widget.methods.findByName(newName)) {
                            throw errorHandler(
                                HttpStatus.BadRequest,
                                `Widget with name "${widget.name}" already exist. Widget name must be unique.`,
                            );
                        }
                        shouldUpdate = true;
                        widget.label = body.label;
                        widget.name = newName;
                    }
                    if (
                        typeof body.desc === 'string' &&
                        body.desc !== widget.desc
                    ) {
                        shouldUpdate = true;
                        widget.desc = body.desc;
                    }
                    if (body.propChanges && body.propChanges.length > 0) {
                        const updatedProps = propsApplyChanges(
                            widget.props,
                            body.propChanges,
                            `(widget: ${widget.name}).props`,
                            false,
                            await Repo.media.findAll(),
                            await Repo.group.findAll(),
                            await Repo.widget.findAll(),
                            await Repo.template.findAll(),
                        );
                        if (updatedProps instanceof Error) {
                            throw errorHandler(
                                HttpStatus.BadRequest,
                                updatedProps.message,
                            );
                        }
                        shouldUpdate = true;
                        widget.props = updatedProps;
                    }
                    if (shouldUpdate) {
                        widget = await Repo.widget.update(widget);
                        SocketManager.channelEmit(
                            ['global'],
                            'widget',
                            {
                                type: 'update',
                                widgetId: widget._id,
                            },
                            [token.payload.userId],
                        );
                    }
                    return {
                        item: widget,
                    };
                },
            }),

            deleteById: createControllerMethod<
                RPJwtCheckResult,
                ControllerItemResponse<Widget>
            >({
                path: '/:widgetId',
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
                            name: 'widgetId',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    summary: 'Delete group by its ID',
                    description:
                        'It is important to know that this method has side' +
                        ' effects, all widget pointers to the deleted widget will be' +
                        ' removed as well.',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemResponseDefinitionForRef(
                                        'Widget',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(['ADMIN']),
                async handler({ request, errorHandler, token }) {
                    const params = request.params as {
                        widgetId: string;
                    };
                    const widget = await Repo.widget.findById(params.widgetId);
                    if (!widget) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Widget with ID "${params.widgetId}" does not exist`,
                        );
                    }
                    await Repo.widget.deleteById(widget._id);
                    SocketManager.channelEmit(
                        ['global'],
                        'widget',
                        {
                            type: 'delete',
                            widgetId: widget._id,
                        },
                        [token.payload.userId],
                    );
                    return {
                        item: widget,
                    };
                },
            }),
        };
    },
});
