import {
    createController,
    createControllerMethod,
} from '@thebcms/selfhosted-backend/_server';
import {
    RP,
    type RPJwtCheckResult,
} from '@thebcms/selfhosted-backend/security/route-protection/main';
import type { PluginList } from '@thebcms/selfhosted-backend/plugin/models/controller';
import { PluginManager } from '@thebcms/selfhosted-backend/plugin/manager';

export const PluginController = createController({
    name: 'Plugin',
    path: '/api/v4/plugin',
    methods() {
        return {
            getAll: createControllerMethod<RPJwtCheckResult, PluginList>({
                path: '/all',
                type: 'get',
                preRequestHandler: RP.createJwtCheck(),
                async handler() {
                    return {
                        list: PluginManager.plugins.map((plugin) => {
                            return {
                                id: plugin.id,
                                name: plugin.name,
                            };
                        }),
                    };
                },
            }),
        };
    },
});
