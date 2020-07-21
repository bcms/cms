import * as path from 'path';
import * as webpack from 'webpack';
import * as HtmlWebPackPlugin from 'html-webpack-plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as VueLoaderPlugin from 'vue-loader/lib/plugin';
import * as LiveReloadPlugin from 'webpack-livereload-plugin';
import { Logger } from '@becomes/purple-cheetah';

export interface WebpackOptions {
  input: string;
  output: string;
  dev: boolean;
}

export class Webpack {
  public static compiler: webpack.Compiler;
  public static watching: webpack.Compiler.Watching;
  private static logger: Logger = new Logger('Webpack');

  public static create(options: WebpackOptions) {
    let mode: 'production' | 'development';
    if (options.dev === true) {
      mode = 'development';
    } else {
      mode = 'production';
    }
    const config: webpack.Configuration = {
      entry: `${options.input}/main.js`,
      mode,
      resolve: {
        extensions: ['.ts', '.js', '.scss', '.html'],
        alias: {
          '@': path.join(process.cwd(), 'src', 'frontend')
        }
      },
      module: {
        rules: [
          {
            test: /\.vue$/,
            exclude: /node_modules/,
            use: {
              loader: 'vue-loader',
            },
          },
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
            },
          },
          {
            test: /\.scss$/,
            use: ['style-loader', 'css-loader', 'sass-loader'],
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
          },
          {
            test: /\.html$/,
            use: {
              loader: 'html-loader',
              options: {},
            },
          },
          {
            test: /\.(png|svg|jpg|gif|mp3)$/,
            use: {
              loader: 'file-loader',
              options: {
                name: 'assets/[contenthash].[ext]',
              },
            },
          },
        ],
      },
      output: {
        publicPath: '/',
        path: path.resolve(options.output),
        filename: 'bundle.js',
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: '[name].css',
          chunkFilename: '[id].css',
        }),
        new VueLoaderPlugin(),
      ],
    };
    if (options.dev) {
      this.dev(options, config);
    } else {
      this.production(options, config);
    }
  }

  private static dev(options: WebpackOptions, config: webpack.Configuration) {
    config.plugins.push(new LiveReloadPlugin());
    config.plugins.push(
      new HtmlWebPackPlugin({
        template: `${options.input}/public/dev-index.html`,
        filename: './index.html',
      }),
    );
    this.compiler = webpack(config);
    this.watching = this.compiler.watch(
      {
        aggregateTimeout: 300,
        poll: undefined,
        ignored: ['./src/server/**', './node_modules/**', './public/**'],
      },
      err => {
        if (err) {
          this.logger.error('watch', 'Error occurred:');
          // tslint:disable-next-line:no-console
          console.error(err);
          return;
        }
        this.logger.info('watch', 'Watching');
      },
    );
  }

  private static production(options: WebpackOptions, config: webpack.Configuration) {
    config.plugins.push(
      new HtmlWebPackPlugin({
        template: `${options.input}/public/index.html`,
        filename: './index.html',
      }),
    );
    webpack(config);
  }
}
