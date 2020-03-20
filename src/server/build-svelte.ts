import * as path from 'path';
import { Logger } from 'purple-cheetah';
import { Rollup } from './rollup';

async function buildSvelte() {
  process.env.SVELTE_PROD = 'true';
  process.env.DEV = 'false';
  const logger = new Logger('Svelte');
  logger.info('init', 'Starting Svelte build...');
  const svelteBuildTimeOffset = Date.now();
  await Rollup.build({
    input: path.resolve('src', 'frontend', 'main.js'),
    output: path.resolve('dist', 'frontend'),
  });
  logger.info(
    'init',
    `Build completed in ${(Date.now() - svelteBuildTimeOffset) / 1000}s`,
  );
}
buildSvelte();
