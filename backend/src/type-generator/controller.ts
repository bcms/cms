import {
    createController,
    createControllerMethod,
    HttpStatus,
} from '@thebcms/selfhosted-backend/_server';
import {
    RP,
    type RPApiKeyJwtCheckResult,
} from '@thebcms/selfhosted-backend/security/route-protection/main';
import type { ControllerItemsResponse } from '@thebcms/selfhosted-backend/util/controller';
import {
    TypeGenerator,
    TypeGeneratorAllowedLanguages,
    type TypeGeneratorFile,
    type TypeGeneratorLanguage,
} from '@thebcms/selfhosted-backend/type-generator/generator/main';
import { controllerItemsResponseDefinitionForRef } from '@thebcms/selfhosted-backend/open-api/schema';
import { Repo } from '@thebcms/selfhosted-backend/repo';

export const TypeGeneratorController = createController({
    name: 'TypeGenerator',
    path: '/api/v4/type-generator',
    methods({ controllerName }) {
        return {
            getTypes: createControllerMethod<
                RPApiKeyJwtCheckResult,
                ControllerItemsResponse<TypeGeneratorFile>
            >({
                path: '/:lang',
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
                            name: 'lang',
                            required: true,
                            schema: {
                                type: 'string',
                                enum: TypeGeneratorAllowedLanguages,
                            },
                        },
                    ],
                    summary: 'Get types for specified language',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: controllerItemsResponseDefinitionForRef(
                                        'TypeGeneratorFile',
                                    ),
                                },
                            },
                        },
                    },
                },
                preRequestHandler: RP.createApiKeyJwtCheck(),
                async handler({ request, errorHandler }) {
                    const params = request.params as {
                        lang: TypeGeneratorLanguage;
                    };
                    if (!TypeGeneratorAllowedLanguages.includes(params.lang)) {
                        throw errorHandler(
                            HttpStatus.BadRequest,
                            `Language "${params.lang}" is not known`,
                        );
                    }
                    const templates = await Repo.template.findAll();
                    const groups = await Repo.group.findAll();
                    const widgets = await Repo.widget.findAll();
                    const languages = await Repo.language.findAll();
                    const typeGen = new TypeGenerator(
                        templates,
                        groups,
                        widgets,
                        languages,
                        params.lang,
                    );
                    const items = typeGen.filesArray();
                    return {
                        items,
                        offset: 0,
                        total: items.length,
                        limit: items.length,
                    };
                },
            }),
        };
    },
});
