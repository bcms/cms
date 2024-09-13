import type {
    ControllerConfig,
    MiddlewareConfig,
    ServerConfig,
} from '@thebcms/selfhosted-backend/server';
import type { FastifyInstance } from 'fastify';

export type PluginPolicyType =
    | 'checkbox'
    | 'select'
    | 'selectArray'
    | 'input'
    | 'inputArray';

export interface PluginPolicy {
    name: string;
    type?: PluginPolicyType;
    options?: string[];
    default?: string[];
}

export interface Plugin {
    id: string;
    name: string;
    policy(): Promise<PluginPolicy[]>;
    controllers: ControllerConfig[];
    middleware: MiddlewareConfig[];
}

export interface PluginCreateData {
    fastify: FastifyInstance;
    rootConfig: ServerConfig;
}
