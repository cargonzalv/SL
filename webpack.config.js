const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'production',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    host: 'localhost',
    port: 9000,
    open: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/html/index.html', to: 'index.html' },
        { from: 'src/html/other.html', to: 'other.html' },
      ],
    }),
  ],
  entry: { 'sps-lib.min.js': './src/main.ts' },
  target: ['web', 'es5'],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  // optimization: {
  //   minimize: false,
  // },
  // performance: false,
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    library: 'spsLib',
  },
};
