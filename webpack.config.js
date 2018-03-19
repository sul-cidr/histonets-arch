var path = require("path");
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');

const devServer = {
  hot: true,
  inline: true,
  historyApiFallback: true,
  publicPath: "/assets/bundles/",
  host: "0.0.0.0",
  port: 8080,
  clientLogLevel: 'error',
  headers: { 'Access-Control-Allow-Origin': '*' },
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 300,
    poll: 100
  }
};

module.exports = {
  devtool: 'source-map',
  mode: process.env.WEBPACK_MODE || 'development',
  context: __dirname,
  entry: {
    'home': [
      'babel-polyfill',
      'react-hot-loader/patch',
      './assets/home'
    ]
  },
  devServer,
  output: {
      path: path.resolve('./assets/bundles/'),
      filename: "[name]-[hash].js",
      publicPath: `http://${devServer.host}:${devServer.port}${devServer.publicPath}`
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new BundleTracker({filename: './webpack-stats.json'}),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  resolve: {
    modules: ['node_modules', 'bower_components'],
    extensions: ['.js', '.jsx']
  }
};
