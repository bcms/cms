import * as path from 'path';
import { Webpack } from './server/webpack/webpack';

Webpack.create({
  input: path.join(__dirname, 'frontend'),
  output: './src/frontend/public/bundle',
  dev: false,
});
