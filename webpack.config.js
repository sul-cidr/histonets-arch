const path = require("path");
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

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
    ],
    'collections.create': [
      'babel-polyfill',
      'react-hot-loader/patch',
      './assets/collections.create'
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
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css"
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
          "style-loader",
          {
            loader: "css-loader",
            options: {
              module: true
            }
          },
          "fast-sass-loader"
        ]
      },
    ]
  },
  resolve: {
    modules: ['node_modules', 'bower_components'],
    extensions: ['.js', '.jsx', '.css', '.scss']
  }
};
