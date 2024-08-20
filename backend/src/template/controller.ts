import { v4 as uuidv4 } from 'uuid';
import {
    createController,
    createControllerMethod,
    HttpStatus,
} from '@thebcms/selfhosted-backend/server';
import {
    RP,
    type RPApiKeyJwtBodyCheckResult,
    type RPApiKeyJwtCheckResult,
} from '@thebcms/selfhosted-backend/security/route-protection/main';
import {
    type TemplateCreateBody,
    TemplateCreateBodySchema,
    type TemplateUpdateBody,
    TemplateUpdateBodySchema,
    type TemplateWhereIsItUsedResult,
} from '@thebcms/selfhosted-backend/template/models/controller';
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
import type { Template } from '@thebcms/selfhosted-backend/template/models/main';
import { TemplateFactory } from '@thebcms/selfhosted-backend/template/factory';
import { PropType } from '@thebcms/selfhosted-backend/prop/models/main';
import { StringUtility } from '@thebcms/selfhosted-backend/_utils/string-utility';
import { SocketManager } from '@thebcms/selfhosted-backend/socket/manager';
import { propsApplyChanges } from '@thebcms/selfhosted-backend/prop/changes';
import { removeEntryPointerProps } from '@thebcms/selfhosted-backend/prop/delete';
import { EventManager } from '@thebcms/selfhosted-backend/event/manager';

export const TemplateController = createController({
    name: 'Template',
    path: '/api/v4/template',
    methods({ controllerName }) {
        return {
            whereIsItUsed: createControllerMethod<
                RPApiKeyJwtCheckResult,
                TemplateWhereIsItUsedResult
            >({
                path: '/:templateId/where-is-it-used',
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
                            name: 'templateId',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    summary:
                        'Get information on where specified template is used',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: openApiGetModelRef(
                                            'TemplateWhereIsItUsedResult',
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
                        templateId: string;
                    };
                    return {
                        groupsIds: (
                            await Repo.group.methods.findAllByPropEntryPointer(
                                params.templateId,
                            )
                        ).map((e) => e._id),
                        templateIds: (
                            await Repo.template.methods.findAllByPropEntryPointer(
                                params.templateId,
                            )
                        ).map((e) => e._id),
                        widgetIds: (
                            await Repo.widget.methods.findAllByPropEntryPointer(
                                params.templateId,
                            )
                        ).map((e) => e._id),
                    };
                },
            }),

            getAll: createControllerMethod<
                RPApiKeyJwtCheckResult,
                ControllerItemsResponse<Template>
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
                    summary: 'Get all templates',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemsResponseDefinitionForRef(
                                        'Template',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(),
                async handler({ token, apiKey }) {
                    let items: Template[] = [];
                    if (token) {
                        items = await Repo.template.findAll();
                    } else if (apiKey) {
                        const templateIds: string[] = [];
                        for (
                            let i = 0;
                            i < apiKey.access.templates.length;
                            i++
                        ) {
                            const access = apiKey.access.templates[i];
                            if (access.get) {
                                templateIds.push(access._id);
                            }
                        }
                        items = await Repo.template.findAllById(templateIds);
                    }
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
                ControllerItemResponse<Template>
            >({
                path: '/:templateId',
                type: 'get',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Get template by its ID',
                    parameters: [
                        {
                            in: 'path',
                            name: 'templateId',
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
                                        'Template',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(),
                async handler({ request, errorHandler }) {
                    const params = request.params as {
                        templateId: string;
                    };
                    const template = await Repo.template.findById(
                        params.templateId,
                    );
                    if (!template) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Template with ID "${params.templateId}" does not exist`,
                        );
                    }
                    return {
                        item: template,
                    };
                },
            }),

            create: createControllerMethod<
                RPApiKeyJwtBodyCheckResult<TemplateCreateBody>,
                ControllerItemResponse<Template>
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
                    summary: 'Create new template',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: openApiGetModelRef(
                                        'TemplateCreateBody',
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
                preRequestHandler: RP.createApiKeyJwtBodyCheck(
                    TemplateCreateBodySchema,
                    ['ADMIN'],
                ),
                async handler({ body, errorHandler, token, apiKey }) {
                    let template = TemplateFactory.create({
                        label: body.label,
                        desc: body.desc,
                        props: [
                            {
                                id: uuidv4(),
                                label: 'Title',
                                name: 'title',
                                array: false,
                                type: PropType.STRING,
                                required: true,
                                data: {
                                    propString: [],
                                },
                            },
                            {
                                id: uuidv4(),
                                label: 'Slug',
                                name: 'slug',
                                array: false,
                                type: PropType.STRING,
                                required: true,
                                data: {
                                    propString: [],
                                },
                            },
                        ],
                        name: StringUtility.toSlug(body.label),
                        userId: token
                            ? token.payload.userId
                            : apiKey
                            ? 'apiKey_' + apiKey._id
                            : '__unknown',
                        singleEntry: body.singleEntry,
                    });
                    if (await Repo.template.methods.findByName(template.name)) {
                        throw errorHandler(
                            HttpStatus.BadRequest,
                            `Template with name "${template.name}" already exist. Template name must be unique.`,
                        );
                    }
                    template = await Repo.template.add(template);
                    SocketManager.channelEmit(
                        ['global'],
                        'template',
                        {
                            type: 'update',
                            templateId: template._id,
                        },
                        token ? [token.payload.userId] : undefined,
                    );
                    EventManager.trigger('add', 'template', template).catch(
                        (err) => console.error(err),
                    );
                    return {
                        item: template,
                    };
                },
            }),

            update: createControllerMethod<
                RPApiKeyJwtBodyCheckResult<TemplateUpdateBody>,
                ControllerItemResponse<Template>
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
                    summary: 'Update existing template',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: openApiGetModelRef(
                                        'TemplateUpdateBody',
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
                preRequestHandler: RP.createApiKeyJwtBodyCheck(
                    TemplateUpdateBodySchema,
                    ['ADMIN'],
                ),
                async handler({ body, errorHandler, token }) {
                    let template = await Repo.template.findById(body._id);
                    if (!template) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Template with ID "${body._id}" does not exist`,
                        );
                    }
                    let shouldUpdate = false;
                    if (body.label && body.label !== template.label) {
                        const newName = StringUtility.toSlug(body.label);
                        if (await Repo.template.methods.findByName(newName)) {
                            throw errorHandler(
                                HttpStatus.BadRequest,
                                `Template with name "${template.name}" already exist. Template name must be unique.`,
                            );
                        }
                        shouldUpdate = true;
                        template.label = body.label;
                        template.name = newName;
                    }
                    if (
                        typeof body.singleEntry === 'boolean' &&
                        body.singleEntry !== template.singleEntry
                    ) {
                        shouldUpdate = true;
                        template.singleEntry = body.singleEntry;
                    }
                    if (
                        typeof body.desc === 'string' &&
                        body.desc !== template.desc
                    ) {
                        shouldUpdate = true;
                        template.desc = body.desc;
                    }
                    if (body.propChanges && body.propChanges.length > 0) {
                        const updatedProps = propsApplyChanges(
                            template.props,
                            body.propChanges,
                            `(template: ${template.name}).props`,
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
                        template.props = updatedProps;
                    }
                    if (shouldUpdate) {
                        template = await Repo.template.update(template);
                        SocketManager.channelEmit(
                            ['global'],
                            'template',
                            {
                                type: 'update',
                                templateId: template._id,
                            },
                            token ? [token.payload.userId] : undefined,
                        );
                        EventManager.trigger(
                            'update',
                            'template',
                            template,
                        ).catch((err) => console.error(err));
                    }
                    return {
                        item: template,
                    };
                },
            }),

            deleteById: createControllerMethod<
                RPApiKeyJwtCheckResult,
                ControllerItemResponse<Template>
            >({
                path: '/:templateId',
                type: 'delete',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Delete template by its ID',
                    description:
                        'By deleting a template, all entries under this template will' +
                        ' also be deleted.',
                    parameters: [
                        {
                            in: 'path',
                            name: 'templateId',
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
                                        'Template',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(['ADMIN']),
                async handler({ request, errorHandler, token }) {
                    const params = request.params as {
                        templateId: string;
                    };
                    const template = await Repo.template.findById(
                        params.templateId,
                    );
                    if (!template) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Template with ID "${params.templateId}" does not exist`,
                        );
                    }
                    await Repo.template.deleteById(template._id);
                    SocketManager.channelEmit(
                        ['global'],
                        'template',
                        {
                            type: 'update',
                            templateId: template._id,
                        },
                        token ? [token.payload.userId] : undefined,
                    );
                    await removeEntryPointerProps(template._id);
                    EventManager.trigger('delete', 'template', template).catch(
                        (err) => console.error(err),
                    );
                    return {
                        item: template,
                    };
                },
            }),
        };
    },
});
