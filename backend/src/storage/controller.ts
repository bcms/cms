import {
    createController,
    createControllerMethod,
    HttpStatus,
} from '@thebcms/selfhosted-backend/_server';
import { Config } from '@thebcms/selfhosted-backend/config';
import {
    Storage,
    type StorageType,
    StorageTypes,
} from '@thebcms/selfhosted-backend/storage/main';
import {
    RP,
    type RPJwtCheckResult,
} from '@thebcms/selfhosted-backend/security/route-protection/main';

export const StorageController = createController({
    name: 'Storage',
    path: `/api/v4/storage/${Config.storageScope}`,
    methods({ controllerName }) {
        return {
            getUserAvatar: createControllerMethod<void, void>({
                path: '/get/user-avatar/:filename',
                type: 'get',
                openApi: {
                    tags: [controllerName],
                    summary: 'Get user avatar',
                    security: [{ accessToken: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'filename',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Ok',
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
                async handler({ request, errorHandler, reply }) {
                    const params = request.params as {
                        filename: string;
                    };
                    try {
                        const data = await Storage.readStream(
                            params.filename,
                            'user-avatar',
                        );
                        reply.header('Content-Type', data.mimetype);
                        reply.header('Cache-Control', 'max-age=31536000');
                        return reply.send(data.stream);
                    } catch (error) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `File not found: ${params.filename}`,
                        );
                    }
                },
            }),

            getOrgImage: createControllerMethod<RPJwtCheckResult, void>({
                path: '/get/:type/:filename',
                type: 'get',
                openApi: {
                    tags: [controllerName],
                    summary: 'Get user avatar',
                    security: [{ accessToken: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'type',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                        {
                            in: 'path',
                            name: 'filename',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Ok',
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
                preRequestHandler: RP.createJwtCheck(),
                async handler({ request, errorHandler, reply }) {
                    const params = request.params as {
                        filename: string;
                        type: StorageType;
                    };
                    if (!StorageTypes[params.type]) {
                        throw errorHandler(
                            HttpStatus.BadRequest,
                            `Type "${params.type}" is not allowed`,
                        );
                    }
                    try {
                        const data = await Storage.readStream(
                            params.filename,
                            params.type,
                        );
                        reply.header('Content-Type', data.mimetype);
                        reply.header('Cache-Control', 'max-age=31536000');
                        return reply.send(data.stream);
                    } catch (error) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `File not found: ${params.filename}`,
                        );
                    }
                },
            }),
        };
    },
});
