import crypto from 'crypto';
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
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@thebcms/selfhosted-backend/util/controller';
import {
    type Media,
    MediaType,
} from '@thebcms/selfhosted-backend/media/models/main';
import {
    controllerItemResponseDefinitionForRef,
    controllerItemsResponseDefinitionForRef,
    openApiGetModelRef,
} from '@thebcms/selfhosted-backend/open-api/schema';
import { Repo } from '@thebcms/selfhosted-backend/repo';
import {
    type MediaCreateDirBody,
    MediaCreateDirBodySchema,
    type MediaDeleteBody,
    MediaDeleteBodySchema,
    type MediaGetBinBody,
    MediaGetBinBodySchema,
    type MediaRequestUploadTokenResult,
    type MediaUpdateBody,
    MediaUpdateBodySchema,
} from '@thebcms/selfhosted-backend/media/models/controller';
import {
    ObjectUtility,
    ObjectUtilityError,
} from '@thebcms/selfhosted-backend/_utils/object-utility';
import { MediaStorage } from '@thebcms/selfhosted-backend/media/storage';
import { keyValueStore } from '@thebcms/selfhosted-backend/key-value-store';
import { MediaFactory } from '@thebcms/selfhosted-backend/media/factory';
import { mimetypeToMediaType } from '@thebcms/selfhosted-backend/media/mimetype';
import { SocketManager } from '@thebcms/selfhosted-backend/socket/manager';
import { EventManager } from '@thebcms/selfhosted-backend/event/manager';

export const MediaController = createController({
    name: 'Media',
    path: '/api/v4/media',
    methods({ controllerName }) {
        return {
            getAll: createControllerMethod<
                RPApiKeyJwtCheckResult,
                ControllerItemsResponse<Media>
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
                    summary: 'Get all media files metadata',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemsResponseDefinitionForRef(
                                        'Media',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(),
                async handler() {
                    const items = await Repo.media.findAll();
                    return {
                        items,
                        limit: items.length,
                        total: items.length,
                        offset: 0,
                    };
                },
            }),

            getById: createControllerMethod<
                RPApiKeyJwtCheckResult,
                ControllerItemResponse<Media>
            >({
                path: '/:mediaId',
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
                            name: 'mediaId',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    summary: 'Get media file metadata by its ID',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemResponseDefinitionForRef(
                                        'Media',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(),
                async handler({ request, errorHandler }) {
                    const params = request.params as {
                        mediaId: string;
                    };
                    const media = await Repo.media.findById(params.mediaId);
                    if (!media) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Media with ID "${params.mediaId}" does not exist`,
                        );
                    }
                    return {
                        item: media,
                    };
                },
            }),

            bin: createControllerMethod<RPApiKeyJwtCheckResult, void>({
                path: '/:mediaId/bin/:filename',
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
                            name: 'mediaId',
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
                        {
                            in: 'query',
                            name: 'data',
                            required: true,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    summary: 'Get binary data for specified media',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'multipart/form-data': {
                                    schema: {
                                        type: 'string',
                                        format: 'binary',
                                    },
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(),
                async handler({ errorHandler, reply, request }) {
                    const params = request.params as {
                        mediaId: string;
                        filename: string;
                    };
                    const query = request.query as {
                        data?: string;
                    };
                    let data: MediaGetBinBody = {
                        thumbnail: false,
                    };
                    if (query.data) {
                        try {
                            data = JSON.parse(
                                Buffer.from(query.data, 'hex').toString(),
                            );
                        } catch (err) {
                            throw errorHandler(
                                HttpStatus.BadRequest,
                                'Invalid data query format',
                            );
                        }
                    }
                    const dataCheck = ObjectUtility.compareWithSchema(
                        data,
                        MediaGetBinBodySchema,
                        'query.data',
                    );
                    if (dataCheck instanceof ObjectUtilityError) {
                        throw errorHandler(
                            HttpStatus.BadRequest,
                            dataCheck.message,
                        );
                    }
                    const media = await Repo.media.findById(params.mediaId);
                    if (!media) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Media with ID "${params.mediaId}" does not exist`,
                        );
                    }
                    if (media.type === MediaType.DIR) {
                        throw errorHandler(
                            HttpStatus.BadRequest,
                            'Directories do not have binary information',
                        );
                    }
                    if (data.image) {
                        const res = await MediaStorage.imageProcessOrGet(
                            media,
                            data.image,
                        );
                        reply.header('Content-Type', res.mimetype);
                        reply.header('Cache-Control', 'max-age=86400');
                        // reply.header('Content-Length', res.buffer.length);
                        // reply.header(
                        //     'Content-Disposition',
                        //     `${
                        //         data.view ? 'inline' : 'attachment'
                        //     }; filename="${encodeURIComponent(media.name)}"`,
                        // );
                        return reply.send(res.buffer);
                    } else {
                        const stream = await MediaStorage.readStream(media, {
                            thumbnail: data.thumbnail,
                        });
                        if (!stream) {
                            throw errorHandler(
                                HttpStatus.InternalServerError,
                                `Failed to find binary data for this media`,
                            );
                        }
                        reply.header('Content-Type', media.mimetype);
                        reply.header('Cache-Control', 'max-age=86400');
                        // reply.header('Content-Length', media.size);
                        // reply.header(
                        //     'Content-Disposition',
                        //     `${
                        //         data.view ? 'inline' : 'attachment'
                        //     }; filename="${encodeURIComponent(media.name)}"`,
                        // );
                        // reply.header(
                        //     'Content-Disposition',
                        //     `${
                        //         data.view ? 'inline' : 'attachment'
                        //     }; filename="${media.name}"`,
                        // );
                        return reply.send(stream);
                    }
                },
            }),

            requestUploadToken: createControllerMethod<
                RPJwtCheckResult,
                MediaRequestUploadTokenResult
            >({
                path: '/request/upload-token',
                type: 'get',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Get media upload token',
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
                preRequestHandler: RP.createJwtCheck(),
                async handler({ token }) {
                    const uploadToken =
                        crypto
                            .createHash('sha256')
                            .update(
                                Date.now() + crypto.randomBytes(16).toString(),
                            )
                            .digest('hex') + `.`;
                    keyValueStore.set(
                        `media_upload_token.${token.payload.userId}`,
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

            createDir: createControllerMethod<
                RPJwtBodyCheckResult<MediaCreateDirBody>,
                ControllerItemResponse<Media>
            >({
                path: '/create/dir',
                type: 'post',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Create media of type DIR',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: openApiGetModelRef(
                                        'MediaCreateDirBody',
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
                                        'Media',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtBodyCheck(
                    MediaCreateDirBodySchema,
                ),
                async handler({ token, body, errorHandler }) {
                    if (body.parentId) {
                        if (
                            await Repo.media.methods.findByParentIdAndName(
                                body.parentId,
                                body.name,
                            )
                        ) {
                            throw errorHandler(
                                HttpStatus.BadRequest,
                                `Media with name "${body.name}" already exist`,
                            );
                        }
                        if (!(await Repo.media.findById(body.parentId))) {
                            throw errorHandler(
                                HttpStatus.NotFound,
                                `Parent media with ID "${body.parentId}" does not exist`,
                            );
                        }
                    } else {
                        if (
                            await Repo.media.methods.findInRootByName(body.name)
                        ) {
                            throw errorHandler(
                                HttpStatus.BadRequest,
                                `Media with name "${body.name}" already exist`,
                            );
                        }
                    }
                    const media = await Repo.media.add(
                        MediaFactory.create({
                            type: MediaType.DIR,
                            isInRoot: !body.parentId,
                            parentId: body.parentId || '',
                            name: body.name,
                            altText: '',
                            caption: '',
                            hasChildren: true,
                            height: -1,
                            width: -1,
                            mimetype: 'dir',
                            size: 4096,
                            userId: token.payload.userId,
                        }),
                    );
                    EventManager.trigger('add', 'media', media).catch((err) =>
                        console.error(err),
                    );
                    return {
                        item: media,
                    };
                },
            }),

            createFile: createControllerMethod<
                void,
                ControllerItemResponse<Media>
            >({
                path: '/create/file',
                type: 'post',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Upload media file',
                    parameters: [
                        {
                            in: 'query',
                            name: 'parentId',
                            required: false,
                            schema: {
                                type: 'string',
                            },
                        },
                        {
                            in: 'query',
                            name: 'token',
                            description: 'Media upload token',
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
                                    schema: controllerItemResponseDefinitionForRef(
                                        'Media',
                                    ),
                                },
                            },
                        },
                    },
                },
                async handler({ request, errorHandler }) {
                    const query = request.query as {
                        parentId?: string;
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
                        keyValueStore.getDel(`media_upload_token.${userId}`)
                    ) {
                        throw errorHandler(
                            HttpStatus.Unauthorized,
                            'Invalid upload token',
                        );
                    }
                    const file = await request.file({
                        limits: {
                            // Limit file size to 100MB
                            fileSize: 104857600,
                        },
                    });
                    if (!file) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            'Missing upload file',
                        );
                    }
                    const fileBuffer = await file.toBuffer();
                    let media = MediaFactory.create({
                        width: -1,
                        height: -1,
                        size: fileBuffer.length,
                        userId,
                        caption: '',
                        altText: '',
                        mimetype: file.mimetype,
                        hasChildren: false,
                        name: file.filename,
                        parentId: query.parentId ? query.parentId : '',
                        isInRoot: !query.parentId,
                        type: mimetypeToMediaType(file.mimetype),
                    });
                    if (
                        await Repo.media.methods.findByParentIdAndName(
                            media.parentId,
                            media.name,
                        )
                    ) {
                        const nameParts = media.name.split('.');
                        const hash = crypto.randomBytes(8).toString('hex');
                        if (nameParts.length > 1) {
                            media.name =
                                nameParts[0] +
                                '-' +
                                hash +
                                '.' +
                                nameParts.slice(1, nameParts.length).join('.');
                        } else {
                            media.name = media.name + '-' + hash;
                        }
                    }
                    await MediaStorage.save(media, fileBuffer);
                    media = await Repo.media.add(media);
                    SocketManager.channelEmit(
                        ['global'],
                        'media',
                        {
                            type: 'update',
                            mediaId: media._id,
                        },
                        [userId],
                    );
                    EventManager.trigger('add', 'media', media).catch((err) =>
                        console.error(err),
                    );
                    return {
                        item: media,
                    };
                },
            }),

            update: createControllerMethod<
                RPJwtBodyCheckResult<MediaUpdateBody>,
                ControllerItemResponse<Media>
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
                    summary: 'Update existing media metadata',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: openApiGetModelRef('MediaUpdateBody'),
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
                                        'Media',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtBodyCheck(MediaUpdateBodySchema),
                async handler({ errorHandler, body, token }) {
                    let media = await Repo.media.findById(body._id);
                    if (!media) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Media with ID "${body._id}" does not exist`,
                        );
                    }
                    let shouldUpdate = false;
                    let checkNameChange = false;
                    if (body.name && body.name !== media.name) {
                        shouldUpdate = true;
                        checkNameChange = true;
                        media.name = body.name;
                    }
                    if (
                        typeof body.parentId === 'string' &&
                        body.parentId !== media.parentId
                    ) {
                        shouldUpdate = true;
                        checkNameChange = true;
                        media.parentId = body.parentId;
                        media.isInRoot = !media.parentId;
                    }
                    if (
                        typeof body.altText === 'string' &&
                        body.altText !== media.altText
                    ) {
                        shouldUpdate = true;
                        media.altText = body.altText;
                    }
                    if (
                        typeof body.caption === 'string' &&
                        body.caption !== media.caption
                    ) {
                        shouldUpdate = true;
                        media.caption = body.caption;
                    }
                    if (checkNameChange) {
                        if (
                            await Repo.media.methods.findByParentIdAndName(
                                media.parentId,
                                media.name,
                            )
                        ) {
                            throw errorHandler(
                                HttpStatus.BadRequest,
                                `Media with name "${media.name}" already exist`,
                            );
                        }
                    }
                    if (shouldUpdate) {
                        media = await Repo.media.update(media);
                        SocketManager.channelEmit(
                            ['global'],
                            'media',
                            {
                                type: 'update',
                                mediaId: media._id,
                            },
                            [token.payload.userId],
                        );
                        EventManager.trigger('update', 'media', media).catch(
                            (err) => console.error(err),
                        );
                    }
                    return {
                        item: media,
                    };
                },
            }),

            deleteByIds: createControllerMethod<
                RPJwtBodyCheckResult<MediaDeleteBody>,
                { ok: boolean }
            >({
                path: '/delete',
                type: 'delete',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Delete 1 or more media files by there IDs',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: openApiGetModelRef('MediaDeleteBody'),
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
                preRequestHandler: RP.createJwtBodyCheck(MediaDeleteBodySchema),
                async handler({ body }) {
                    const allMedia = await Repo.media.findAll();
                    const mediaToDelete: {
                        [mediaId: string]: Media;
                    } = {};
                    for (let i = 0; i < body.mediaIds.length; i++) {
                        const media = allMedia.find(
                            (e) => e._id === body.mediaIds[i],
                        );
                        if (media) {
                            mediaToDelete[media._id] = media;
                            if (media.type === MediaType.DIR) {
                                let children = allMedia.filter(
                                    (e) => e.parentId === media._id,
                                );
                                while (children.length > 0) {
                                    const child = children.pop() as Media;
                                    mediaToDelete[child._id] = child;
                                    if (child.type === MediaType.DIR) {
                                        children = [
                                            ...children,
                                            ...allMedia.filter(
                                                (e) => e.parentId === child._id,
                                            ),
                                        ];
                                    }
                                }
                            }
                        }
                    }
                    const deletePaths: string[] = [];
                    const medias: Media[] = [];
                    for (const mediaId in mediaToDelete) {
                        medias.push(mediaToDelete[mediaId]);
                        if (
                            [
                                MediaType.GIF,
                                MediaType.IMG,
                                MediaType.VID,
                            ].includes(mediaToDelete[mediaId].type)
                        ) {
                            deletePaths.push(
                                MediaStorage.resolveCloudPath(
                                    mediaToDelete[mediaId],
                                    {
                                        thumbnail: true,
                                    },
                                ),
                            );
                        }
                        console.log({ mediaId, mediaToDelete });
                        deletePaths.push(
                            MediaStorage.resolveCloudPath(
                                mediaToDelete[mediaId],
                            ),
                        );
                    }
                    await Repo.media.methods.deleteManyById(
                        medias.map((e) => e._id),
                    );
                    SocketManager.channelEmit(['global'], 'media', {
                        type: 'delete',
                        mediaId: 'many',
                    });
                    await MediaStorage.removeMany(deletePaths);
                    for (let i = 0; i < medias.length; i++) {
                        EventManager.trigger(
                            'delete',
                            'media',
                            medias[i],
                        ).catch((err) => console.error(err));
                    }
                    return {
                        ok: true,
                    };
                },
            }),
        };
    },
});
