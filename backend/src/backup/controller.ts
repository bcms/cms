import {
    createController,
    createControllerMethod,
    HttpStatus,
} from '@thebcms/selfhosted-backend/server';
import {
    RP,
    type RPJwtCheckResult,
} from '@thebcms/selfhosted-backend/security/route-protection/main';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@thebcms/selfhosted-backend/util/controller';
import {
    controllerItemResponseDefinitionForRef,
    controllerItemsResponseDefinitionForRef,
} from '@thebcms/selfhosted-backend/open-api/schema';
import { Repo } from '@thebcms/selfhosted-backend/repo';
import type { Backup } from '@thebcms/selfhosted-backend/backup/models/main';
import { SocketManager } from '@thebcms/selfhosted-backend/socket/manager';
import { BackupFactory } from '@thebcms/selfhosted-backend/backup/factory';
import { BackupManager } from '@thebcms/selfhosted-backend/backup/manager';
import { EventManager } from '@thebcms/selfhosted-backend/event/manager';

export const BackupController = createController({
    name: 'Backup',
    path: '/api/v4/backup',
    methods({ controllerName }) {
        return {
            getAll: createControllerMethod<
                RPJwtCheckResult,
                ControllerItemsResponse<Backup>
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
                    summary: 'Get all backup metadata',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemsResponseDefinitionForRef(
                                        'Backup',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(['ADMIN']),
                async handler() {
                    const items = await Repo.backup.findAll();
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
                ControllerItemResponse<Backup>
            >({
                path: '/:backupId',
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
                            name: 'backupId',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    summary: 'Get specified backup metadata',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemResponseDefinitionForRef(
                                        'Backup',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(['ADMIN']),
                async handler({ request, errorHandler }) {
                    const params = request.params as {
                        backupId: string;
                    };
                    const backup = await Repo.backup.findById(params.backupId);
                    if (!backup) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Backup with ID "${params.backupId}" does not exist`,
                        );
                    }
                    return {
                        item: backup,
                    };
                },
            }),

            download: createControllerMethod<
                RPJwtCheckResult,
                ControllerItemResponse<Backup>
            >({
                path: '/download/:backupId',
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
                            name: 'backupId',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    summary: 'Get backup file',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'image/*': {
                                    schema: {
                                        type: 'string',
                                        format: 'binary',
                                    },
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(['ADMIN']),
                async handler({ request, errorHandler, reply }) {
                    const params = request.params as {
                        backupId: string;
                    };
                    const backup = await Repo.backup.findById(
                        params.backupId.replace('.zip', ''),
                    );
                    if (!backup) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Backup with ID "${params.backupId}" does not exist`,
                        );
                    }
                    const stream = await BackupManager.getFileStream(backup);
                    reply.header('Content-Type', 'application/zip');
                    reply.header('Cache-Control', 'max-age=31536000');
                    return reply.send(stream);
                },
            }),

            create: createControllerMethod<
                RPJwtCheckResult,
                ControllerItemResponse<Backup>
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
                    summary: 'Create new backup',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemResponseDefinitionForRef(
                                        'Backup',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(['ADMIN']),
                async handler({ token }) {
                    const backup = await Repo.backup.add(
                        BackupFactory.create({
                            name: new Date().toISOString().replace(/ /g, '_'),
                            userId: token.payload.userId,
                            ready: false,
                            size: -1,
                            inQueue: true,
                            doneAt: -1,
                        }),
                    );
                    SocketManager.channelEmit(
                        ['global'],
                        'backup',
                        {
                            type: 'update',
                            backupId: backup._id,
                        },
                        [token.payload.userId],
                    );
                    BackupManager.create(backup).catch((err) => {
                        console.error(err);
                    });
                    EventManager.trigger('add', 'backup', backup).catch((err) =>
                        console.error(err),
                    );
                    return {
                        item: backup,
                    };
                },
            }),

            deleteById: createControllerMethod<
                RPJwtCheckResult,
                ControllerItemResponse<Backup>
            >({
                path: '/:backupId',
                type: 'delete',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Delete a backup',
                    parameters: [
                        {
                            in: 'path',
                            name: 'backupId',
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
                                        'Backup',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(['ADMIN']),
                async handler({ request, errorHandler }) {
                    const params = request.params as {
                        backupId: string;
                    };
                    const backup = await Repo.backup.findById(params.backupId);
                    if (!backup) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Backup with ID "${params.backupId}" does not exist`,
                        );
                    }
                    await Repo.backup.deleteById(backup._id);
                    await BackupManager.remove(backup._id);
                    EventManager.trigger('delete', 'backup', backup).catch(
                        (err) => console.error(err),
                    );
                    return { item: backup };
                },
            }),
        };
    },
});
