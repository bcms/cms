import * as path from 'path';
import { App } from './app';
import { Webpack } from './webpack/webpack';

if (process.env.DEV === 'true') {
  Webpack.create({
    input: path.join(__dirname, '..', 'frontend'),
    output: './src/frontend/public/bundle',
    dev: true,
  });
}

const app = new App();
app.listen();
