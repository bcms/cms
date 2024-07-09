import fdb, { type FastifyMongodbOptions } from '@fastify/mongodb';
import type { Module } from '@thebcms/selfhosted-backend/server/module';

export type MongoDBConfig = FastifyMongodbOptions;

export function createMongoDB(config: MongoDBConfig): Module {
    return {
        name: 'MongoDB',
        initialize({ next, fastify }) {
            async function init() {
                await fastify.register(fdb, {
                    ...config,
                });
            }
            init()
                .then(() => next())
                .catch((err) => next(err));
        },
    };
}
