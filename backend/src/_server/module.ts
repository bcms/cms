import type { FastifyInstance } from 'fastify';
import type {
    Controller,
    Middleware,
} from '@thebcms/selfhosted-backend/server/rest';
import type { ServerConfig } from '@thebcms/selfhosted-backend/server/main';

export interface ModuleConfig {
    name: string;
    rootConfig: ServerConfig;
    fastify: FastifyInstance;
    next(
        error?: Error,
        data?: {
            controllers?: Controller[];
            middleware?: Middleware[];
        },
    ): void;
}
export interface Module {
    name: string;
    initialize(config: ModuleConfig): void;
}
