import {
    type Controller,
    createController,
    createMiddleware,
    Logger,
    type Middleware,
    type Module,
} from '@thebcms/selfhosted-backend/_server';
import { FS } from '@thebcms/selfhosted-utils/fs';
import path from 'path';
import { ChildProcess } from '@thebcms/selfhosted-utils/child-process';
import type { PluginConfig } from '@thebcms/selfhosted-backend/plugin/models/config';
import type { Plugin } from '@thebcms/selfhosted-backend/plugin/models/main';
import type { PluginCreateData } from '@thebcms/selfhosted-backend/plugin/models/main';
import { PluginManager } from '@thebcms/selfhosted-backend/plugin/manager';

export function createBcmsPlugins(): Module {
    return {
        name: 'Plugins',
        initialize({ next, fastify, rootConfig }) {
            const controllers: Controller[] = [];
            const middleware: Middleware[] = [];
            const availablePluginVersions = ['1'];
            const logger = new Logger('Plugins');
            async function init() {
                const fs = new FS(path.join(process.cwd(), 'plugins'));
                const fileNames = await fs.readdir('');
                for (let i = 0; i < fileNames.length; i++) {
                    let fileName = fileNames[i];
                    if (fileName.endsWith('.zip')) {
                        await ChildProcess.spawn('unzip', [fileName], {
                            cwd: fs.baseRoot,
                            stdio: 'inherit',
                        });
                        fileName = fileName.replace('.zip', '');
                    }
                    const config: PluginConfig = JSON.parse(
                        await fs.readString([fileName, 'config.json']),
                    );
                    if (!availablePluginVersions.includes(config.version)) {
                        logger.warn(
                            'init',
                            `Skipping plugin "${fileName}" because of invalid config version`,
                        );
                        continue;
                    }
                    let mainFilename = 'main.js';
                    if (await fs.exist([fileName, 'main.js'], true)) {
                        mainFilename = 'main.js';
                    } else if (await fs.exist([fileName, 'main.ts'], true)) {
                        mainFilename = 'main.ts';
                    } else {
                        logger.warn(
                            'init',
                            `Skipping plugin "${fileName}" because main entrypoint was not found.`,
                        );
                        continue;
                    }
                    const main: {
                        default: (data: PluginCreateData) => Promise<Plugin>;
                    } = await import(
                        `${fs.baseRoot}/${fileName}/${mainFilename}`
                    );
                    const result = await main.default({
                        fastify,
                        rootConfig,
                    });
                    PluginManager.plugins.push(result);
                    for (let j = 0; j < result.controllers.length; j++) {
                        const controller = result.controllers[j];
                        controller.path = `/api/v4/plugin/${result.id}/${controller.path}`;
                        controllers.push(createController(controller));
                    }
                    for (let j = 0; j < result.middleware.length; j++) {
                        const mid = result.middleware[j];
                        mid.path = `/api/v4/plugin/${result.id}/${mid.path}`;
                        middleware.push(createMiddleware(mid));
                    }
                }
            }
            init()
                .then(() => next(undefined, { controllers, middleware }))
                .catch((err) => next(err));
        },
    };
}
