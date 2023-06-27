const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/dev/main.ts',
  mode: 'development',
  resolve: {
    extensions: ['.ts', '.js', '.html'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
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
        test: /\.html$/,
        use: {
          loader: 'html-loader',
          options: {},
        },
      },
    ],
  },
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/dev/main.html',
      filename: './index.html',
    }),
  ],
};
