import {
    createController,
    createControllerMethod,
    HttpException,
    HttpStatus,
    Logger,
} from '@thebcms/selfhosted-backend/_server';
import {
    RP,
    type RPApiKeyCheckResult,
    type RPApiKeyJwtCheckResult,
} from '@thebcms/selfhosted-backend/security/route-protection/main';
import type { ControllerItemsResponse } from '@thebcms/selfhosted-backend/util/controller';
import type { BCMSFunctionConfig } from '@thebcms/selfhosted-backend/function/models/main';
import { controllerItemResponseDefinitionForRef } from '@thebcms/selfhosted-backend/open-api/schema';
import { FunctionManager } from '@thebcms/selfhosted-backend/function/main';
import type { FunctionExecuteResult } from '@thebcms/selfhosted-backend/function/models/controller';

export const FunctionController = createController({
    name: 'Function',
    path: '/api/v4/function',
    methods({ controllerName }) {
        return {
            getAvailable: createControllerMethod<
                RPApiKeyJwtCheckResult,
                ControllerItemsResponse<BCMSFunctionConfig>
            >({
                path: '/available',
                type: 'get',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            accessToken: [],
                        },
                    ],
                    summary: 'Get available functions',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemResponseDefinitionForRef(
                                        'BCMSFunctionConfig',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(['ADMIN']),
                async handler({ apiKey }) {
                    const fns = FunctionManager.getAll();
                    let items: BCMSFunctionConfig[] = [];
                    if (apiKey) {
                        items = fns
                            .filter((fn) =>
                                apiKey.access.functions.find(
                                    (e) => e.name === fn.config.name,
                                ),
                            )
                            .map((fn) => fn.config);
                    } else {
                        items = fns.map((fn) => fn.config);
                    }
                    return {
                        items,
                        total: items.length,
                        limit: items.length,
                        offset: 0,
                    };
                },
            }),

            execute: createControllerMethod<
                RPApiKeyCheckResult,
                FunctionExecuteResult<unknown>
            >({
                path: '/:fnName',
                type: 'post',
                openApi: {
                    tags: [controllerName],
                    security: [
                        {
                            apiKey: [],
                        },
                    ],
                    summary: 'Execute a specified function',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        required: ['success'],
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                            },
                                            result: {
                                                type: 'any' as never,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyCheck(),
                async handler({ apiKey, request, errorHandler }) {
                    const params = request.params as {
                        fnName: string;
                    };
                    const fn = FunctionManager.get(params.fnName);
                    if (!fn) {
                        throw errorHandler(
                            HttpStatus.NotFound,
                            `Function with name "${params.fnName}" does not exist`,
                        );
                    }
                    if (!fn.config.public) {
                        if (
                            !apiKey.access.functions.find(
                                (e) => e.name === fn.config.name,
                            )
                        ) {
                            throw errorHandler(
                                HttpStatus.Forbidden,
                                `API Key does not what access to this function`,
                            );
                        }
                    }
                    const fnLogger = new Logger(fn.config.name);
                    try {
                        const result = await fn.handler({
                            request,
                            errorHandler,
                            logger: fnLogger,
                            apiKey,
                        });
                        return {
                            success: true,
                            result,
                        };
                    } catch (error) {
                        if (error instanceof HttpException) {
                            throw error;
                        } else {
                            console.error(error);
                            throw errorHandler(
                                HttpStatus.InternalServerError,
                                'Unknown error',
                            );
                        }
                    }
                },
            }),
        };
    },
});
