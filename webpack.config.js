const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/cli.ts',
  devtool: 'inline-source-map',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      "fs": false,
      "child_process": false,
      "url": false
    }
  },
  plugins: [
    new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
  ],
  output: {
    filename: 'cli.js',
    path: path.resolve(__dirname, 'dist'),
  }
};