import * as path from 'path';
import { App } from './app.module';
import { Logger } from 'purple-cheetah';
import { Rollup } from './rollup/rollup';

function svelte() {
  const logger = new Logger('Svelte');
  logger.info('init', 'Starting Svelte build...');
  const svelteBuildTimeOffset = Date.now();
  Rollup.build({
    input: path.join(__dirname, '..', 'frontend', 'main.js'),
    output: path.join(process.env.PROJECT_ROOT, 'public'),
  }).then(() => {
    logger.info(
      'init',
      `Build completed in ${(Date.now() - svelteBuildTimeOffset) / 1000}s`,
    );
  });
}
// svelte();

/**
 * Application Object that starts ExpressJS server.
 */
const app = new App();
app.listen();
