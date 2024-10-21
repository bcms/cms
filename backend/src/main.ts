import path from 'path';
import {
    createController,
    createControllerMethod,
    createServer,
} from '@bcms/selfhosted-backend/_server';
import FastifyMultipart from '@fastify/multipart';
import FastifyStatic from '@fastify/static';
import FastifyCors from '@fastify/cors';
import {
    createJwt,
    JWTError,
    JWTManager,
} from '@bcms/selfhosted-backend/_server/modules/jwt';
import { Config } from '@bcms/selfhosted-backend/config';
import { createSocket } from '@bcms/selfhosted-backend/_server/modules/socket';
import { Repo } from '@bcms/selfhosted-backend/repo';
import { createMongoDB } from '@bcms/selfhosted-backend/_server/modules/mongodb';
import {
    createMigrations,
    MigrationRepo,
} from '@bcms/selfhosted-backend/migrations';
import { FS } from '@bcms/selfhosted-utils/fs';
import { IPMiddleware } from '@bcms/selfhosted-backend/ip-middleware';
import {
    AuthController,
    setAuthCreateAdminServerToken,
} from '@bcms/selfhosted-backend/auth/controller';
import { UserController } from '@bcms/selfhosted-backend/user/controller';
import { StorageController } from '@bcms/selfhosted-backend/storage/controller';
import type { UserCustomPool } from '@bcms/selfhosted-backend/user/models/custom-pool';
import { socketEventHandlersEntrySync } from '@bcms/selfhosted-backend/socket/handlers/entry-sync';
import {
    createEntrySyncChannelHandler,
    useEntrySyncChannelHandler,
} from '@bcms/selfhosted-backend/entry-sync/channel-handler';
import { MediaController } from '@bcms/selfhosted-backend/media/controller';
import { ApiKeyController } from '@bcms/selfhosted-backend/api-key/controller';
import { EntryController } from '@bcms/selfhosted-backend/entry/controller';
import { EntryStatusController } from '@bcms/selfhosted-backend/entry-status/controller';
import { GroupController } from '@bcms/selfhosted-backend/group/controller';
import { LanguageController } from '@bcms/selfhosted-backend/language/controller';
import { TemplateController } from '@bcms/selfhosted-backend/template/controller';
import { WidgetController } from '@bcms/selfhosted-backend/widget/controller';
import { TemplateOrganizerController } from '@bcms/selfhosted-backend/template-organizer/controller';
import { BackupController } from '@bcms/selfhosted-backend/backup/controller';
import { FunctionController } from '@bcms/selfhosted-backend/function/controllert';
import { FunctionManager } from '@bcms/selfhosted-backend/function/main';
import { UIProxy } from '@bcms/selfhosted-backend/ui-proxy';
import { TypeGeneratorController } from '@bcms/selfhosted-backend/type-generator/controller';
import { EventManager } from '@bcms/selfhosted-backend/event/manager';
import { createBcmsJobs } from '@bcms/selfhosted-backend/job/main';
import { createBcmsPlugins } from '@bcms/selfhosted-backend/plugin/main';
import { PluginController } from '@bcms/selfhosted-backend/plugin/controller';
import { openApiGetSchema } from '@bcms/selfhosted-backend/open-api/main';
import { createCustomDependenciesInit } from '@bcms/selfhosted-backend/custom-dependencies-init';

async function main() {
    await createServer({
        server: {
            host: '0.0.0.0',
            port: 8080,
        },

        logs: {
            saveToFile: {
                output: path.join(process.cwd(), 'logs'),
                interval: 5000,
            },
        },
        openApi: openApiGetSchema(),

        onReady({ config }) {
            async function init() {
                const users = await Repo.user.findAll();
                if (
                    users.length === 0 ||
                    !users.find((user) =>
                        user.roles.find((role) => role.name === 'ADMIN'),
                    )
                ) {
                    const message =
                        'Server token: ' + setAuthCreateAdminServerToken();
                    console.log(Array(message.length).fill('-').join(''));
                    console.log(message);
                    console.log(Array(message.length).fill('-').join(''));
                }
                if (config.openApi) {
                    const fs = new FS(process.cwd());
                    await fs.save(
                        ['docs', 'swagger.json'],
                        JSON.stringify(config.openApi, null, '  '),
                    );
                }
            }
            init().catch((err) => console.error(err));
        },

        controllers: [
            createController({
                path: '/api/v4',
                name: 'HealthCheck',
                methods() {
                    return {
                        check: createControllerMethod({
                            path: '/health-check',
                            type: 'head',
                            async handler() {
                                return { ok: true };
                            },
                        }),
                    };
                },
            }),
            createController({
                path: '/api/v4/docs',
                name: 'Docs',
                methods() {
                    const fs = new FS(process.cwd());
                    return {
                        swagger: createControllerMethod<void, string>({
                            path: '/swagger.json',
                            type: 'get',
                            async handler({ reply }) {
                                const data = await fs.readString([
                                    'docs',
                                    'swagger.json',
                                ]);
                                reply.header(
                                    'Content-Type',
                                    'application/json',
                                );
                                return data;
                            },
                        }),
                    };
                },
            }),
            ApiKeyController,
            AuthController,
            EntryController,
            EntryStatusController,
            GroupController,
            LanguageController,
            MediaController,
            StorageController,
            TemplateController,
            TemplateOrganizerController,
            UserController,
            WidgetController,
            BackupController,
            FunctionController,
            TypeGeneratorController,
            PluginController,
        ],

        middleware: [IPMiddleware, UIProxy],

        modules: [
            {
                name: 'Fastify modules',
                initialize({ next, fastify }) {
                    async function init() {
                        await fastify.register(FastifyMultipart);
                        await fastify.register(FastifyStatic, {
                            root: path.join(process.cwd(), 'public'),
                        });
                        await fastify.register(FastifyCors, {});
                    }
                    init()
                        .then(() => next())
                        .catch((err) => next(err));
                },
            },
            createJwt({
                scopes: [
                    {
                        alg: 'HS256',
                        expIn: Config.jwtExpIn,
                        issuer: Config.jwtIssuer,
                        secret: Config.jwtSecret,
                    },
                ],
            }),
            createSocket({
                path: '/api/v4/socket',
                async validateConnection({ req }, next) {
                    const queryString = req.url ? req.url.split('?')[1] : '';
                    if (!queryString) {
                        next(false);
                        return;
                    }
                    const query: { [key: string]: string } = {};
                    const queryParts = queryString.split('&');
                    for (let i = 0; i < queryParts.length; i++) {
                        const [key, value] = queryParts[i].split('=');
                        query[key] = value;
                    }
                    if (!query.token) {
                        next(false);
                        return;
                    }
                    if (query.token.startsWith('apikey_')) {
                        const [id, secret] = query.token
                            .replace('apikey_', '')
                            .split('.');
                        const apiKey = await Repo.apiKey.findById(id);
                        if (
                            !apiKey ||
                            apiKey.secret !== secret ||
                            apiKey.blocked
                        ) {
                            next(false);
                            return;
                        }
                        next(true);
                    } else {
                        const jwt = JWTManager.get({
                            roles: ['ADMIN', 'USER'],
                            token: query.token,
                        });
                        if (jwt instanceof JWTError) {
                            next(false);
                            return;
                        }
                        next(true);
                    }
                },
                async onConnection(connection, req) {
                    const queryString = req.url ? req.url.split('?')[1] : '';
                    if (!queryString) {
                        return;
                    }
                    const query: { [key: string]: string } = {};
                    const queryParts = queryString.split('&');
                    for (let i = 0; i < queryParts.length; i++) {
                        const [key, value] = queryParts[i].split('=');
                        query[key] = value;
                    }
                    if (!query.token) {
                        return;
                    }
                    if (query.token.startsWith('apikey_')) {
                        const [id, secret] = query.token
                            .replace('apikey_', '')
                            .split('.');
                        const apiKey = await Repo.apiKey.findById(id);
                        if (!apiKey || apiKey.secret !== secret) {
                            return;
                        }
                        connection.channels.push(
                            apiKey.userId,
                            'apiKey',
                            'global',
                        );
                        connection.emit('socket_connection', {
                            id: connection.id,
                        });
                    } else {
                        const jwt = JWTManager.get<UserCustomPool>({
                            roles: ['ADMIN', 'USER'],
                            token: query.token,
                        });
                        if (jwt instanceof JWTError) {
                            return;
                        }
                        connection.channels.push(
                            jwt.payload.userId,
                            ...jwt.payload.rls,
                            'user',
                            'global',
                        );
                        connection.emit('socket_connection', {
                            id: connection.id,
                        });
                    }
                },
                eventHandlers: {
                    ...socketEventHandlersEntrySync,
                },
                async onDisconnect(conn) {
                    const chan = useEntrySyncChannelHandler();
                    const chanKeysInfo = chan.getAllKeysInfo();
                    for (let i = 0; i < chanKeysInfo.length; i++) {
                        if (conn.id === chanKeysInfo[i].connId) {
                            chan.removeConnection(
                                chanKeysInfo[i].entryId,
                                conn.id,
                                conn.channels[0],
                            );
                            break;
                        }
                    }
                },
            }),
            createMongoDB({
                forceClose: true,
                url: Config.dbUrl,
            }),
            /**
             * ----------
             * Init repos
             * ----------
             */
            Repo.user.init(),
            Repo.apiKey.init(),
            Repo.media.init(),
            Repo.group.init(),
            Repo.widget.init(),
            Repo.template.init(),
            Repo.templateOrganizer.init(),
            Repo.entry.init(),
            Repo.language.init(),
            Repo.entryStatus.init(),
            Repo.backup.init(),
            MigrationRepo.init(),
            // @inject-repo

            createEntrySyncChannelHandler(),
            createMigrations(),

            createCustomDependenciesInit(),
            {
                name: 'FunctionManager',
                initialize({ next }) {
                    FunctionManager.init()
                        .then(() => next())
                        .catch((err) => next(err));
                },
            },
            {
                name: 'EventManager',
                initialize({ next }) {
                    EventManager.init()
                        .then(() => next())
                        .catch((err) => next(err));
                },
            },
            createBcmsJobs(),

            createBcmsPlugins(),
        ],
    });
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
