import type {
    Plugin,
    PluginCreateData,
} from '@bcms/selfhosted-backend/plugin/models/main';
import type {
    ControllerConfig,
    MiddlewareConfig,
} from '@bcms/selfhosted-backend/_server';

export function createPlugin(
    init: (data: PluginCreateData) => Promise<Plugin>,
) {
    return init;
}

export function createPluginController(
    config: ControllerConfig,
): ControllerConfig {
    return config;
}

export function createPluginMiddleware(
    config: MiddlewareConfig,
): MiddlewareConfig {
    return config;
}
