import * as arg from 'arg';
import * as path from 'path';
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

export function cli(args: any) {
  const options = parseArgsIntoOptions(args);
  process.env.PROJECT_ROOT = process.cwd();
  const config = require(path.join(process.env.PROJECT_ROOT, 'bcms-config.js'));
  if (config.env && typeof config.env === 'object') {
    for (const key in config.env) {
      process.env[key] = `${config.env[key]}`;
    }
  }
  process.env.PORT = `${config.server.port}`;
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
  process.env.GITHUB_USERNAME = `${config.server.github.username}`;
  process.env.GITHUB_PASSWORD = `${config.server.github.password}`;
  process.env.SVELTE_PROD = 'true';
  process.env.DEV = 'false';

  if (options.dev) {
    initChangeListener();
  }
  buildSvelte();
  const { App } = require(`${packageName}/app.module.js`);
  const app = new App();
  app.listen();
}
