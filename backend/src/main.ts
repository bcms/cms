import path from 'path';
import {
    createController,
    createControllerMethod,
    createServer,
} from '@thebcms/selfhosted-backend/server';
import FastifyMultipart from '@fastify/multipart';
import FastifyStatic from '@fastify/static';
import FastifyCors from '@fastify/cors';
import {
    createJwt,
    JWTError,
    JWTManager,
} from '@thebcms/selfhosted-backend/server/modules/jwt';
import { Config } from '@thebcms/selfhosted-backend/config';
import { createSocket } from '@thebcms/selfhosted-backend/server/modules/socket';
import { Repo } from '@thebcms/selfhosted-backend/repo';
import { createMongoDB } from '@thebcms/selfhosted-backend/server/modules/mongodb';
import {
    createMigrations,
    MigrationRepo,
} from '@thebcms/selfhosted-backend/migrations';
import { FS } from '@thebcms/selfhosted-backend/_utils/fs';
import { IPMiddleware } from '@thebcms/selfhosted-backend/ip-middleware';
import {
    AuthController,
    setAuthCreateAdminServerToken,
} from '@thebcms/selfhosted-backend/auth/controller';
import { UserController } from '@thebcms/selfhosted-backend/user/controller';
import { StorageController } from '@thebcms/selfhosted-backend/storage/controller';
import type { UserCustomPool } from '@thebcms/selfhosted-backend/user/models/custom-pool';
import { socketEventHandlersEntrySync } from '@thebcms/selfhosted-backend/socket/handlers/entry-sync';
import {
    createEntrySyncChannelHandler,
    useEntrySyncChannelHandler,
} from '@thebcms/selfhosted-backend/entry-sync/channel-handler';
import { MediaController } from '@thebcms/selfhosted-backend/media/controller';
import { ApiKeyController } from '@thebcms/selfhosted-backend/api-key/controller';
import { EntryController } from '@thebcms/selfhosted-backend/entry/controller';
import { EntryStatusController } from '@thebcms/selfhosted-backend/entry-status/controller';
import { GroupController } from '@thebcms/selfhosted-backend/group/controller';
import { LanguageController } from '@thebcms/selfhosted-backend/language/controller';
import { TemplateController } from '@thebcms/selfhosted-backend/template/controller';
import { WidgetController } from '@thebcms/selfhosted-backend/widget/controller';
import { TemplateOrganizerController } from '@thebcms/selfhosted-backend/template-organizer/controller';
import { BackupController } from '@thebcms/selfhosted-backend/backup/controller';

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

        onReady() {
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
                        swagger: createControllerMethod({
                            path: '/swagger.json',
                            type: 'get',
                            async handler({ replay }) {
                                const data = await fs.readString([
                                    'docs',
                                    'swagger.json',
                                ]);
                                replay.header(
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
        ],

        middleware: [IPMiddleware],

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
            // @inject-repo

            MigrationRepo.init(),

            createEntrySyncChannelHandler(),
            createMigrations(),
        ],
    });
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
