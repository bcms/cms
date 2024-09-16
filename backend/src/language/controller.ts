import {
    createController,
    createControllerMethod,
    HttpStatus,
} from '@thebcms/selfhosted-backend/_server';
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
import type { Language } from '@thebcms/selfhosted-backend/language/models/main';
import {
    controllerItemResponseDefinitionForRef,
    controllerItemsResponseDefinitionForRef,
    openApiGetModelRef,
} from '@thebcms/selfhosted-backend/open-api/schema';
import { Repo } from '@thebcms/selfhosted-backend/repo';
import {
    type LanguageCreateBody,
    LanguageCreateBodySchema,
} from '@thebcms/selfhosted-backend/language/models/controller';
import { LanguageFactory } from '@thebcms/selfhosted-backend/language/factory';
import { SocketManager } from '@thebcms/selfhosted-backend/socket/manager';
import { EventManager } from '@thebcms/selfhosted-backend/event/manager';

export const LanguageController = createController({
    name: 'Language',
    path: '/api/v4/language',
    methods({ controllerName }) {
        return {
            getAll: createControllerMethod<
                RPApiKeyJwtCheckResult,
                ControllerItemsResponse<Language>
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
                    summary: 'Get all languages in the instance',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemsResponseDefinitionForRef(
                                        'Language',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(),
                async handler() {
                    const languages = await Repo.language.findAll();
                    return {
                        items: languages,
                        limit: languages.length,
                        total: languages.length,
                        offset: 0,
                    };
                },
            }),

            getById: createControllerMethod<
                RPApiKeyJwtCheckResult,
                ControllerItemResponse<Language>
            >({
                path: '/:languageId',
                type: 'get',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Get language by its ID',
                    parameters: [
                        {
                            in: 'path',
                            name: 'languageId',
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
                                        'Language',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(),
                async handler({ request, errorHandler }) {
                    const params = request.params as {
                        languageId: string;
                    };
                    const language = await Repo.language.findById(
                        params.languageId,
                    );
                    if (!language) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Language with ID "${params.languageId}" does not exist`,
                        );
                    }
                    return {
                        item: language,
                    };
                },
            }),

            create: createControllerMethod<
                RPJwtBodyCheckResult<LanguageCreateBody>,
                ControllerItemResponse<Language>
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
                    summary: 'Create new language',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: openApiGetModelRef(
                                        'LanguageCreateBody',
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
                                        'Language',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtBodyCheck(
                    LanguageCreateBodySchema,
                    ['ADMIN'],
                ),
                async handler({ body, token }) {
                    const languageWithSameCode =
                        await Repo.language.methods.findByCode(body.code);
                    if (languageWithSameCode) {
                        return { item: languageWithSameCode };
                    }
                    const language = await Repo.language.add(
                        LanguageFactory.create({
                            code: body.code,
                            name: body.name,
                            nativeName: body.nativeName,
                            userId: token.payload.userId,
                            default: false,
                        }),
                    );
                    SocketManager.channelEmit(
                        ['global'],
                        'language',
                        {
                            type: 'update',
                            languageId: language._id,
                        },
                        [token.payload.userId],
                    );
                    EventManager.trigger('add', 'language', language).catch(
                        (err) => console.error(err),
                    );
                    return {
                        item: language,
                    };
                },
            }),

            deleteById: createControllerMethod<
                RPJwtCheckResult,
                ControllerItemResponse<Language>
            >({
                path: '/:languageId',
                type: 'delete',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Delete language by its ID',
                    parameters: [
                        {
                            in: 'path',
                            name: 'languageId',
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
                                        'Language',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createJwtCheck(['ADMIN']),
                async handler({ request, errorHandler }) {
                    const params = request.params as {
                        orgId: string;
                        instanceId: string;
                        languageId: string;
                    };
                    const language = await Repo.language.findById(
                        params.languageId,
                    );
                    if (!language) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Language with ID "${params.languageId}" does not exist`,
                        );
                    }
                    await Repo.language.deleteById(language._id);
                    EventManager.trigger('delete', 'language', language).catch(
                        (err) => console.error(err),
                    );
                    return {
                        item: language,
                    };
                },
            }),
        };
    },
});
