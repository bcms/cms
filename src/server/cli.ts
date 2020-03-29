import * as arg from 'arg';
import * as path from 'path';
import * as fs from 'fs';
import * as childProcess from 'child_process';
import * as util from 'util';
import { Rollup } from './rollup';

const packageName = '.';
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const removeFile = util.promisify(fs.unlink);
const copyFile = util.promisify(fs.copyFile);

function parseArgsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--dev': Boolean,
      '--custom_front_dev': Boolean,
      '--build:': Boolean,
      '-d': '--dev',
      '-b': '--build',
      '-cfd': '--custom_front_dev',
    },
    {
      argv: rawArgs.slice(2),
    },
  );
  return {
    dev: args['--dev'] || false,
    build: args['--build'] || false,
    cfd: args['--custom_front_dev'] || false,
  };
}

async function buildSvelte(config: any, options: any) {
  // tslint:disable-next-line: no-console
  console.log('CLI - Build Svelte:', 'Starting Svelte build...');
  const svelteBuildTimeOffset = Date.now();
  try {
    await mkdir(path.join(process.env.PROJECT_ROOT, 'public', 'custom'));
  } catch (error) {}
  let appSvelte: string = (
    await readFile(path.join(__dirname, 'frontend', 'custom', 'App.svelte'))
  ).toString();
  appSvelte = appSvelte.replace(
    '@custom_path',
    path.join(process.env.PROJECT_ROOT, 'custom', 'App.svelte'),
  );
  appSvelte = appSvelte.replace(
    '@props',
    config.frontend.custom.props
      .map(e => {
        if (typeof e === 'string') {
          return `{${e}}`;
        } else {
          return `${e.name}="${e.value}"`;
        }
      })
      .join(' '),
  );
  await writeFile(
    path.join(__dirname, 'frontend', 'custom', 'App.temp.svelte'),
    appSvelte,
  );
  await Rollup.build({
    input: path.join(__dirname, 'frontend', 'custom', 'main.js'),
    output: path.join(process.env.PROJECT_ROOT, 'public', 'custom'),
    dev: options.cfd,
  });
  // tslint:disable-next-line: no-console
  console.log(
    'CLI - Build Svelte:',
    `Build completed in ${(Date.now() - svelteBuildTimeOffset) / 1000}s`,
  );
  await copyFile(
    path.join(__dirname, 'frontend', 'custom', 'index.html'),
    path.join(process.env.PROJECT_ROOT, 'public', 'custom', 'index.html'),
  );
}

export async function cli(args: any) {
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

  if (config.server.git.use === true) {
    process.env.GIT_USERNAME = `${config.server.git.username}`;
    process.env.GIT_PASSWORD = `${config.server.git.password}`;
    process.env.GIT_HOST = `${config.server.git.host}`;
    process.env.GIT_REPO = `${config.server.git.repo}`;
    process.env.GIT_REPO_OWNER = `${config.server.git.repo_owner}`;
  }

  if (options.dev === true) {
    process.env.SVELTE_PROD = 'false';
    process.env.DEV = 'true';
  } else {
    process.env.SVELTE_PROD = 'true';
    process.env.DEV = 'false';
  }
  if (
    config.frontend &&
    config.frontend.custom &&
    config.frontend.useCustom === true
  ) {
    process.env.CUSTOM_FRONT_PATH = `${path.join(
      process.env.PROJECT_ROOT,
      'custom',
    )}`;
    config.frontend.custom.absPath = process.env.CUSTOM_FRONT_PATH;
    try {
      await buildSvelte(config, options);
    } catch (error) {
      // tslint:disable-next-line: no-console
      console.error(error);
      throw new Error(error);
    }
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
  }
  // if (config.frontend.build === true) {
  //   buildSvelte();
  // }
  const { App } = require(`${packageName}/app.module.js`);
  const app = new App();
  app.listen();
}
