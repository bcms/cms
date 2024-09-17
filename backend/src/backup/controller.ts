import {
    createController,
    createControllerMethod,
    HttpStatus,
} from '@bcms/selfhosted-backend/_server';
import {
    RP,
    type RPJwtCheckResult,
} from '@bcms/selfhosted-backend/security/route-protection/main';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';
import {
    controllerItemResponseDefinitionForRef,
    controllerItemsResponseDefinitionForRef,
    openApiGetModelRef,
} from '@bcms/selfhosted-backend/open-api/schema';
import { Repo } from '@bcms/selfhosted-backend/repo';
import type { Backup } from '@bcms/selfhosted-backend/backup/models/main';
import { SocketManager } from '@bcms/selfhosted-backend/socket/manager';
import { BackupFactory } from '@bcms/selfhosted-backend/backup/factory';
import { BackupManager } from '@bcms/selfhosted-backend/backup/manager';
import { EventManager } from '@bcms/selfhosted-backend/event/manager';
import type { MediaRequestUploadTokenResult } from '@bcms/selfhosted-backend/media/models/controller';
import crypto from 'crypto';
import { keyValueStore } from '@bcms/selfhosted-backend/key-value-store';

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

            requestRestoreUploadToken: createControllerMethod<
                RPJwtCheckResult,
                MediaRequestUploadTokenResult
            >({
                path: '/request/restore-upload-token',
                type: 'get',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Get restore upload token',
                    description:
                        'This token is required to successfully upload binary file.',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: openApiGetModelRef(
                                            'MediaRequestUploadTokenResult',
                                        ),
                                    },
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(['ADMIN']),
                async handler({ token }) {
                    const uploadToken =
                        crypto
                            .createHash('sha256')
                            .update(
                                Date.now() + crypto.randomBytes(16).toString(),
                            )
                            .digest('hex') + `.`;
                    keyValueStore.set(
                        `backup_restore_upload_token.${token.payload.userId}`,
                        `${token.payload.userId}.${uploadToken}.`,
                        {
                            expIn: 900,
                        },
                    );
                    return {
                        token: `${token.payload.userId}.${uploadToken}.`,
                    };
                },
            }),

            restore: createControllerMethod<void, { ok: boolean }>({
                path: '/restore',
                type: 'post',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Upload restore file',
                    parameters: [
                        {
                            in: 'query',
                            name: 'token',
                            description: 'Restore upload token',
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
                                            format: 'binary',
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
                async handler({ request, errorHandler }) {
                    const query = request.query as {
                        token?: string;
                    };
                    if (typeof query.token !== 'string') {
                        throw errorHandler(
                            HttpStatus.Unauthorized,
                            'Missing upload token',
                        );
                    }
                    const tokenParts = query.token.split('.');
                    const userId = tokenParts[0];
                    if (
                        query.token !==
                        keyValueStore.getDel(
                            `backup_restore_upload_token.${userId}`,
                        )
                    ) {
                        throw errorHandler(
                            HttpStatus.Unauthorized,
                            'Invalid upload token',
                        );
                    }
                    const file = await request.file();
                    if (!file) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            'Missing restore file',
                        );
                    }
                    const fileBuffer = await file.toBuffer();
                    await BackupManager.restore(fileBuffer);
                    return {
                        ok: true,
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
