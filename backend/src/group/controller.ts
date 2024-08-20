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
    type GroupCreateBody,
    GroupCreateBodySchema,
    type GroupUpdateBody,
    GroupUpdateBodySchema,
    type GroupWhereIsItUsedResult,
} from '@thebcms/selfhosted-backend/group/models/controller';
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
import type { Group } from '@thebcms/selfhosted-backend/group/models/main';
import { GroupFactory } from '@thebcms/selfhosted-backend/group/factory';
import { StringUtility } from '@thebcms/selfhosted-backend/_utils/string-utility';
import { SocketManager } from '@thebcms/selfhosted-backend/socket/manager';
import { propsApplyChanges } from '@thebcms/selfhosted-backend/prop/changes';
import { propsValidationTestInfiniteLoop } from '@thebcms/selfhosted-backend/prop/validate';
import { removeGroupPointerProps } from '@thebcms/selfhosted-backend/prop/delete';
import { EventManager } from '@thebcms/selfhosted-backend/event/manager';

export const GroupController = createController({
    name: 'Group',
    path: '/api/v4/group',
    methods({ controllerName }) {
        return {
            whereIsItUsed: createControllerMethod<
                RPApiKeyJwtCheckResult,
                GroupWhereIsItUsedResult
            >({
                path: '/:groupId/where-is-it-used',
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
                            name: 'groupId',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    summary:
                        'Get information on where specified group is used.',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: openApiGetModelRef(
                                            'GroupWhereIsItUsedResult',
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
                        groupId: string;
                        instanceId: string;
                        orgId: string;
                    };
                    return {
                        groupIds: (
                            await Repo.group.methods.findAllByPropGroupPointer(
                                params.groupId,
                            )
                        ).map((e) => e._id),
                        templateIds: (
                            await Repo.template.methods.findAllByPropGroupPointer(
                                params.groupId,
                            )
                        ).map((e) => e._id),
                        widgetIds: (
                            await Repo.widget.methods.findAllByPropGroupPointer(
                                params.groupId,
                            )
                        ).map((e) => e._id),
                    };
                },
            }),

            getAll: createControllerMethod<
                RPApiKeyJwtCheckResult,
                ControllerItemsResponse<Group>
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
                    summary: 'Get all groups for specified instance',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemsResponseDefinitionForRef(
                                        'Group',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(),
                async handler() {
                    const items = await Repo.group.findAll();
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
                ControllerItemResponse<Group>
            >({
                path: '/:groupId',
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
                            name: 'groupId',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    summary: 'Get specified group by its ID',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemResponseDefinitionForRef(
                                        'Group',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(),
                async handler({ request, errorHandler }) {
                    const params = request.params as {
                        groupId: string;
                    };
                    const group = await Repo.group.findById(params.groupId);
                    if (!group) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Group with ID "${params.groupId}" does not exist`,
                        );
                    }
                    return {
                        item: group,
                    };
                },
            }),

            create: createControllerMethod<
                RPJwtBodyCheckResult<GroupCreateBody>,
                ControllerItemResponse<Group>
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
                    summary: 'Create new group',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: openApiGetModelRef('GroupCreateBody'),
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
                                        'Group',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtBodyCheck(
                    GroupCreateBodySchema,
                    ['ADMIN'],
                ),
                async handler({ body, errorHandler, token }) {
                    let group = GroupFactory.create({
                        label: body.label,
                        desc: body.desc,
                        props: [],
                        name: StringUtility.toSlug(body.label),
                        userId: token.payload.userId,
                    });
                    if (await Repo.group.methods.findByName(group.name)) {
                        throw errorHandler(
                            HttpStatus.BadRequest,
                            `Group with name "${group.name}" already exist. Group name must be unique.`,
                        );
                    }
                    group = await Repo.group.add(group);
                    SocketManager.channelEmit(
                        ['global'],
                        'group',
                        {
                            type: 'update',
                            groupId: group._id,
                        },
                        [token.payload.userId],
                    );
                    EventManager.trigger('add', 'group', group).catch((err) =>
                        console.error(err),
                    );
                    return {
                        item: group,
                    };
                },
            }),

            update: createControllerMethod<
                RPJwtBodyCheckResult<GroupUpdateBody>,
                ControllerItemResponse<Group>
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
                    summary: 'Update existing group information',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: openApiGetModelRef('GroupUpdateBody'),
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
                                        'Group',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtBodyCheck(
                    GroupUpdateBodySchema,
                    ['ADMIN'],
                ),
                async handler({ body, errorHandler, token }) {
                    let group = await Repo.group.findById(body._id);
                    if (!group) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Group with ID "${body._id}" does not exist`,
                        );
                    }
                    let shouldUpdate = false;
                    if (body.label && body.label !== group.label) {
                        const newName = StringUtility.toSlug(body.label);
                        if (await Repo.group.methods.findByName(newName)) {
                            throw errorHandler(
                                HttpStatus.BadRequest,
                                `Group with name "${group.name}" already exist. Group name must be unique.`,
                            );
                        }
                        shouldUpdate = true;
                        group.label = body.label;
                        group.name = newName;
                    }
                    if (
                        typeof body.desc === 'string' &&
                        body.desc !== group.desc
                    ) {
                        shouldUpdate = true;
                        group.desc = body.desc;
                    }
                    if (body.propChanges && body.propChanges.length > 0) {
                        const updatedProps = propsApplyChanges(
                            group.props,
                            body.propChanges,
                            `(group: ${group.name}).props`,
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
                        group.props = updatedProps;
                    }
                    const infiniteLoopTest = propsValidationTestInfiniteLoop(
                        group.props,
                        {
                            group: [
                                {
                                    _id: group._id,
                                    label: group.label,
                                },
                            ],
                        },
                        'group',
                        await Repo.group.findAll(),
                    );
                    if (infiniteLoopTest instanceof Error) {
                        throw errorHandler(
                            HttpStatus.Forbidden,
                            infiniteLoopTest.message,
                        );
                    }
                    if (shouldUpdate) {
                        group = await Repo.group.update(group);
                        SocketManager.channelEmit(
                            ['global'],
                            'group',
                            {
                                type: 'update',
                                groupId: group._id,
                            },
                            [token.payload.userId],
                        );
                        EventManager.trigger('update', 'group', group).catch(
                            (err) => console.error(err),
                        );
                    }
                    return {
                        item: group,
                    };
                },
            }),

            deleteById: createControllerMethod<
                RPJwtCheckResult,
                ControllerItemResponse<Group>
            >({
                path: '/:groupId',
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
                            name: 'groupId',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    summary: 'Delete group by its ID',
                    description:
                        'It is important to know that this method has side' +
                        ' effects, all group pointers to the deleted group will be' +
                        ' removed as well.',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemResponseDefinitionForRef(
                                        'Group',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(['ADMIN']),
                async handler({ request, errorHandler, token }) {
                    const params = request.params as {
                        groupId: string;
                    };
                    const group = await Repo.group.findById(params.groupId);
                    if (!group) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Group with ID "${params.groupId}" does not exist`,
                        );
                    }
                    await Repo.group.deleteById(group._id);
                    SocketManager.channelEmit(
                        ['global'],
                        'group',
                        {
                            type: 'delete',
                            groupId: group._id,
                        },
                        [token.payload.userId],
                    );
                    await removeGroupPointerProps(group._id);
                    EventManager.trigger('delete', 'group', group).catch(
                        (err) => console.error(err),
                    );
                    return {
                        item: group,
                    };
                },
            }),
        };
    },
});
