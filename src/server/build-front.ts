import * as path from 'path';
import { Logger } from 'purple-cheetah';
import { Rollup } from './rollup';

async function buildSvelte() {
  const logger = new Logger('Svelte');
  logger.info('init', 'Starting Svelte build...');
  const svelteBuildTimeOffset = Date.now();
  if (
    process.env.CUSTOM_FRONT_PATH &&
    process.env.CUSTOM_FRONT_PATH !== 'undefined'
  ) {
    await Rollup.build({
      input: path.join(process.env.CUSTOM_FRONT_PATH, 'main.js'),
      output: path.join(process.env.PROJECT_ROOT, 'public'),
    });
    logger.info(
      'init',
      `Build completed in ${(Date.now() - svelteBuildTimeOffset) / 1000}s`,
    );
  } else {
    await Rollup.build({
      input: path.join(__dirname, '..', 'frontend', 'main.js'),
      output: path.join(process.env.PROJECT_ROOT, 'public'),
    });
    logger.info(
      'init',
      `Build completed in ${(Date.now() - svelteBuildTimeOffset) / 1000}s`,
    );
  }
}
buildSvelte();
