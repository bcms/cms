import * as arg from 'arg';
import * as path from 'path';
import * as childProcess from 'child_process';
import * as util from 'util';
import { FunctionsConfig } from './function/config';
import { Logger } from 'purple-cheetah';
import { Rollup } from './rollup';

const packageName = '.';

function parseArgsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--dev': Boolean,
      '-d': '--dev',
    },
    {
      argv: rawArgs.slice(2),
    },
  );
  return {
    dev: args['--dev'] || false,
  };
}

function initChangeListener() {
  let startWatching: boolean = false;
  setTimeout(() => {
    startWatching = true;
  }, 1000);
  const chokidar = require('chokidar');
  const watcher = chokidar.watch(
    path.join(process.env.PROJECT_ROOT, 'functions'),
    {
      ignored: /^\./,
      persistent: true,
    },
  );
  watcher
    .on('add', location => {
      if (startWatching === true) {
        FunctionsConfig.clear();
        setTimeout(async () => {
          FunctionsConfig.init();
        }, 100);
      }
    })
    .on('change', location => {
      if (startWatching === true) {
        FunctionsConfig.clear();
        setTimeout(async () => {
          FunctionsConfig.init();
        }, 100);
      }
    })
    .on('unlink', location => {
      if (startWatching === true) {
        FunctionsConfig.clear();
        setTimeout(async () => {
          FunctionsConfig.init();
        }, 100);
      }
    })
    .on('error', error => {
      // tslint:disable-next-line:no-console
      console.error('Error happened', error);
    });
}

function buildSvelte() {
  const logger = new Logger('Svelte');
  logger.info('init', 'Starting Svelte build...');
  const svelteBuildTimeOffset = Date.now();
  if (
    process.env.CUSTOM_FRONT_PATH &&
    process.env.CUSTOM_FRONT_PATH !== 'undefined'
  ) {
    Rollup.build({
      input: path.join(process.env.CUSTOM_FRONT_PATH, 'main.js'),
      output: path.join(process.env.PROJECT_ROOT, 'public'),
    }).then(() => {
      logger.info(
        'init',
        `Build completed in ${(Date.now() - svelteBuildTimeOffset) / 1000}s`,
      );
    });
  } else {
    Rollup.build({
      input: path.join(__dirname, 'frontend', 'main.js'),
      output: path.join(process.env.PROJECT_ROOT, 'public'),
    }).then(() => {
      logger.info(
        'init',
        `Build completed in ${(Date.now() - svelteBuildTimeOffset) / 1000}s`,
      );
    });
  }
}

export function cli(args: any) {
  const options = parseArgsIntoOptions(args);
  process.env.PROJECT_ROOT = process.cwd();
  const config = require(path.join(process.env.PROJECT_ROOT, 'bcms-config.js'));
  if (config.env && typeof config.env === 'object') {
    for (const key in config.env) {
      process.env[key] = `${config.env[key]}`;
    }
  }
  if (typeof config.server.port !== 'undefined') {
    process.env.PORT = `${config.server.port}`;
  }
  process.env.USER_TOKEN_SECRET = `${config.server.security.jwt.secret}`;
  process.env.USER_TOKEN_ISSUER = `${config.server.security.jwt.issuer}`;
  process.env.DB_HOST = `${config.server.database.mongo.database.host}`;
  process.env.DB_PORT = `${config.server.database.mongo.database.port}`;
  process.env.DB_NAME = `${config.server.database.mongo.database.name}`;
  process.env.DB_USER = `${config.server.database.mongo.database.user}`;
  process.env.DB_PASS = `${config.server.database.mongo.database.pass}`;
  process.env.DB_PRFX = `${config.server.database.mongo.database.prefix}`;
  process.env.DB_CLUSTER = `${config.server.database.mongo.database.cluster}`;
  process.env.DB_TYPE = `${config.server.database.type}`;

  process.env.GIT_USERNAME = `${config.server.git.username}`;
  process.env.GIT_PASSWORD = `${config.server.git.password}`;
  process.env.GIT_HOST = `${config.server.git.host}`;
  process.env.GIT_REPO = `${config.server.git.repo}`;
  process.env.GIT_REPO_OWNER = `${config.server.git.repo_owner}`;

  process.env.SVELTE_PROD = 'true';
  process.env.DEV = 'false';
  if (config.frontend && config.frontend.custom) {
    process.env.CUSTOM_FRONT_PATH = `${path.join(
      process.env.PROJECT_ROOT,
      config.frontend.custom.root,
    )}`;
  }

  if (config.server.git.install === true) {
    util
      .promisify(childProcess.exec)(
        `git config --global user.email "${config.server.git.email}" && ` +
          `git config --global user.name "${config.server.git.username}" && ` +
          `git checkout ${config.server.git.branch}`,
      )
      .catch(e => {
        // tslint:disable-next-line:no-console
        console.error(e);
      });
  }

  if (options.dev) {
    process.env.SVELTE_PROD = 'false';
    initChangeListener();
  }
  if (config.frontend.build === true) {
    buildSvelte();
  }
  const { App } = require(`${packageName}/app.module.js`);
  const app = new App();
  app.listen();
}
