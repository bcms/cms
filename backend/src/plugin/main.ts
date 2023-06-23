import type { Express } from 'express';
import * as fileSystem from 'fs';
import * as path from 'path';
import * as util from 'util';
import {
  useFS,
  useLogger,
  useObjectUtility,
  useStringUtility,
} from '@becomes/purple-cheetah';
import {
  Controller,
  FS,
  Logger,
  Middleware,
  Module,
  ObjectUtilityError,
  StringUtility,
} from '@becomes/purple-cheetah/types';
import {
  BCMSPlugin,
  BCMSPluginConfig,
  BCMSPluginConfigSchema,
  BCMSPluginManager,
  BCMSPluginInfo,
  BCMSUserPolicyPlugin,
} from '../types';
import { bcmsGetDirFileTree } from '@backend/util';
import { BCMSShimService } from '@backend/shim';
import { ChildProcess } from '@banez/child_process';
import { BCMSRepo } from '@backend/repo';
import type { BCMSConfig } from '@backend/config';

export function createBcmsPlugin(config: BCMSPluginConfig): BCMSPlugin {
  const objectUtil = useObjectUtility();
  const checkConfig = objectUtil.compareWithSchema(
    config,
    BCMSPluginConfigSchema,
    'config',
  );
  if (checkConfig instanceof ObjectUtilityError) {
    throw Error(checkConfig.message);
  }
  return {
    name: config.name,
    policy: config.policy
      ? config.policy
      : async () => {
          return [];
        },
    controllers: config.controllers ? config.controllers : [],
    middleware: config.middleware ? config.middleware : [],
  };
}

export function createBcmsPluginModule(bcmsConfig: typeof BCMSConfig): Module {
  const logger = useLogger({ name: 'Plugin loader' });
  async function injectPaths(fs: FS, location: string) {
    if (await fs.exist(location)) {
      const filesData = await bcmsGetDirFileTree(location, '');
      for (let i = 0; i < filesData.length; i++) {
        const fileData = filesData[i];
        if (fileData.abs.endsWith('.js')) {
          let file = (await fs.read(fileData.abs)).toString();
          file = file.replace(
            /@becomes\/cms-backend/g,
            path.join(process.cwd(), 'src'),
          );
          await util.promisify(fileSystem.writeFile)(fileData.abs, file);
        }
      }
    }
  }
  async function loadNext(data: {
    index: number;
    controllers: Controller[];
    middleware: Middleware[];
    addedPlugins: BCMSPluginInfo[];
    stringUtil: StringUtility;
    fs: FS;
    logger: Logger;
    expressApp: Express;
  }): Promise<{
    controllers: Controller[];
    middleware: Middleware[];
  }> {
    if (!bcmsConfig.plugins || !bcmsConfig.plugins[data.index]) {
      return {
        controllers: data.controllers,
        middleware: data.middleware,
      };
    }
    const localPluginPath = path.join(
      process.cwd(),
      'plugins',
      bcmsConfig.plugins[data.index],
      'backend',
    );
    const nodeModulePluginPath = path.join(
      process.cwd(),
      'node_modules',
      bcmsConfig.plugins[data.index],
      'backend',
    );
    let pluginPath = '';
    let pluginDirPath = path.join(
      process.cwd(),
      'node_modules',
      bcmsConfig.plugins[data.index],
    );
    if (await data.fs.exist(localPluginPath)) {
      pluginPath = localPluginPath;
      pluginDirPath = path.join(
        process.cwd(),
        'plugins',
        bcmsConfig.plugins[data.index],
      );
    } else if (await data.fs.exist(nodeModulePluginPath)) {
      pluginPath = nodeModulePluginPath;
    } else {
      data.logger.error(
        '',
        `Plugin with name "${bcmsConfig.plugins[data.index]}" does not exist.`,
      );
      return {
        controllers: data.controllers,
        middleware: data.middleware,
      };
    }
    await injectPaths(data.fs, pluginPath);
    if (await data.fs.exist(path.join(pluginPath, 'main.ts'), true)) {
      pluginPath = path.join(pluginPath, 'main.ts');
    } else if (await data.fs.exist(path.join(pluginPath, 'main.js'), true)) {
      pluginPath = path.join(pluginPath, 'main.js');
    } else {
      data.logger.error(
        '',
        `Plugin with name "${
          bcmsConfig.plugins[data.index]
        }" does not contain "main.js" or "main.ts" file at path ${pluginPath}.`,
      );
      return {
        controllers: data.controllers,
        middleware: data.middleware,
      };
    }
    const plugin: { default: BCMSPlugin } = await import(pluginPath);
    if (!plugin || !plugin.default || !plugin.default.name) {
      return {
        controllers: data.controllers,
        middleware: data.middleware,
      };
    }
    plugin.default.name = data.stringUtil.toSlug(plugin.default.name);
    if (data.addedPlugins.find((e) => e.name === plugin.default.name)) {
      data.logger.error(
        '',
        `Plugin with name "${plugin.default.name}" is duplicate.`,
      );
      return {
        controllers: data.controllers,
        middleware: data.middleware,
      };
    }
    data.addedPlugins.push({
      name: plugin.default.name,
      dirPath: pluginDirPath,
      policy: plugin.default.policy,
    });
    try {
      const verifyResult: { ok: boolean } = await BCMSShimService.send({
        uri: `/instance/plugin/verify/${plugin.default.name}`,
        payload: {},
      });

      if (!verifyResult.ok) {
        data.logger.error(
          '',
          `Plugin "${plugin.default.name}" is denied by the BCMS Cloud.`,
        );
        return {
          controllers: data.controllers,
          middleware: data.middleware,
        };
      }
    } catch (error) {
      const err = error as Error;
      data.logger.error('', {
        message: `Plugin "${plugin.default.name}".`,
        error: {
          message: err.message,
          stack: err.stack ? err.stack.split('\n') : '',
        },
      });
      return {
        controllers: data.controllers,
        middleware: data.middleware,
      };
    }

    if (plugin.default.controllers) {
      for (let j = 0; j < plugin.default.controllers.length; j++) {
        data.controllers.push(async () => {
          const controller = await plugin.default.controllers[j]({
            expressApp: data.expressApp,
          });
          controller.path = `/api/plugin/${plugin.default.name}${
            controller.path.startsWith('/')
              ? controller.path
              : '/' + controller.path
          }`;
          return controller;
        });
      }
    }
    if (plugin.default.middleware) {
      for (let j = 0; j < plugin.default.middleware.length; j++) {
        data.middleware.push(() => {
          const mid = plugin.default.middleware[j]();
          mid.path = `/api/plugin/${plugin.default.name}${
            mid.path.startsWith('/') ? mid.path : '/' + mid.path
          }`;
          return mid;
        });
      }
    }
    data.logger.info('', plugin.default.name + ' loaded successfully');
    return await loadNext({
      index: data.index + 1,
      controllers: data.controllers,
      middleware: data.middleware,
      addedPlugins: data.addedPlugins,
      stringUtil: data.stringUtil,
      fs: data.fs,
      logger: data.logger,
      expressApp: data.expressApp,
    });
  }
  async function installLocalPlugins(fs: FS) {
    if (await fs.exist(path.join(process.cwd(), 'plugins'))) {
      const files = await fs.readdir(path.join(process.cwd(), 'plugins'));
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.endsWith('.tgz')) {
          logger.info('installing', `    ---- ${file}`);
          await ChildProcess.spawn('npm', ['i', '--save', `./plugins/${file}`]);
          logger.info('installed', `    ---- ${file}`);
        }
      }
    }
  }
  async function setupUsers(plugins: BCMSPluginInfo[]): Promise<void> {
    const users = await BCMSRepo.user.findAll();
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      let modified = false;
      const pluginsToRemove: string[] = [];
      if (user.customPool.policy.plugins) {
        for (let j = 0; j < user.customPool.policy.plugins.length; j++) {
          const userPlugin = user.customPool.policy.plugins[j];
          if (!plugins.find((e) => e.name === userPlugin.name)) {
            pluginsToRemove.push(userPlugin.name);
          }
        }
      }
      if (pluginsToRemove.length > 0) {
        modified = true;
        user.customPool.policy.plugins = (
          user.customPool.policy.plugins as BCMSUserPolicyPlugin[]
        ).filter((e) => !pluginsToRemove.includes(e.name));
      }
      for (let j = 0; j < plugins.length; j++) {
        const plugin = plugins[j];
        if (
          user.customPool.policy.plugins &&
          user.customPool.policy.plugins.length > 0
        ) {
          const userPlugin = user.customPool.policy.plugins.find(
            (e) => e.name === plugin.name,
          );
          if (!userPlugin) {
            modified = true;
            user.customPool.policy.plugins.push({
              allowed: false,
              fullAccess: false,
              name: plugin.name,
              options: (await plugin.policy()).map((e) => {
                return {
                  name: e.name,
                  value: e.default ? e.default : [],
                };
              }),
            });
          }
        } else {
          modified = true;
          user.customPool.policy.plugins = [
            {
              allowed: false,
              fullAccess: false,
              name: plugin.name,
              options: [],
            },
          ];
        }
      }
      if (modified) {
        await BCMSRepo.user.update(user);
      }
    }
    const apiKeys = await BCMSRepo.apiKey.findAll();
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      let modified = false;
      const pluginsToRemove: string[] = [];
      if (apiKey.access.plugins) {
        for (let j = 0; j < apiKey.access.plugins.length; j++) {
          const apiKeyPlugin = apiKey.access.plugins[j];
          if (!plugins.find((e) => e.name === apiKeyPlugin.name)) {
            pluginsToRemove.push(apiKeyPlugin.name);
          }
        }
        if (pluginsToRemove.length > 0) {
          modified = true;
          apiKey.access.plugins = apiKey.access.plugins.filter(
            (e) => !pluginsToRemove.includes(e.name),
          );
        }
      }
      if (modified) {
        await BCMSRepo.apiKey.update(apiKey);
      }
    }
  }

  return {
    name: 'Plugins',
    initialize({ next, expressApp }) {
      const addedPlugins: BCMSPluginInfo[] = [];
      const stringUtil = useStringUtility();
      const fs = useFS();

      if (bcmsConfig.plugins && bcmsConfig.plugins.length > 0) {
        installLocalPlugins(fs)
          .then(async () => {
            const result = await loadNext({
              index: 0,
              controllers: [],
              middleware: [],
              addedPlugins,
              stringUtil,
              fs,
              logger,
              expressApp,
            });
            pluginManager = {
              getList() {
                return addedPlugins.map((e) => e.name);
              },
              getListInfo() {
                return addedPlugins;
              },
            };
            await setupUsers(addedPlugins);
            next(undefined, {
              controllers: result.controllers,
              middleware: result.middleware,
            });
          })
          .catch((error) => {
            next(error);
          });
      } else {
        pluginManager = {
          getList() {
            return addedPlugins.map((e) => e.name);
          },
          getListInfo() {
            return addedPlugins;
          },
        };
        setupUsers(addedPlugins)
          .then(() => next())
          .catch((err) => next(err));
      }
    },
  };
}

let pluginManager: BCMSPluginManager;

export function useBcmsPluginManager(): BCMSPluginManager {
  return pluginManager;
}
