const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const config = {
  mode: 'production',
  context: __dirname,
  entry: {
    'home': [
      './assets/home'
    ],
    'collections.create': [
      './assets/collections.create'
    ]
  },
  output: {
      path: path.resolve('./assets/bundles/'),
      filename: '[name]-[hash].js',
      publicPath: '/static/bundles/'
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new BundleTracker({filename: './webpack-stats.json'}),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css'
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.scss/,
        use: [
          // MiniCssExtractPlugin.loader,
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              module: true
            }
          },
          'fast-sass-loader'
        ]
      },
    ]
  },
  resolve: {
    modules: ['node_modules', 'bower_components'],
    extensions: ['.js', '.jsx', '.css', '.scss']
  }
};
if (process.env.WEBPACK_MODE !== 'production') {
  config.devtool = 'source-map';
  config.mode = 'development';
  config.devServer = {
    hot: true,
    inline: true,
    historyApiFallback: true,
    publicPath: '/assets/bundles/',
    host: '0.0.0.0',
    port: 8080,
    clientLogLevel: 'error',
    headers: { 'Access-Control-Allow-Origin': '*' },
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 300,
      poll: 100
    }
  }
  config.output.publicPath = `http://${config.devServer.host}:${config.devServer.port}${config.devServer.publicPath}`
  config.plugins.splice(0, 0, new webpack.HotModuleReplacementPlugin());
  Object.entries(config.entry).map(([, entries]) => entries.splice(0, 0, 'babel-polyfill', 'react-hot-loader/patch'));
}

module.exports = config;
