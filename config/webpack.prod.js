const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const merge = require('webpack-merge');
const cssnano = require('cssnano');
const common = require('./webpack.common');
const paths = require('./paths');

module.exports = merge(common, {
  mode: 'production',
  output: {
    publicPath: './',
  },
  devtool: 'source-map',
  devServer: {
    contentBase: paths.build,
    compress: true,
    port: 9000,
    disableHostCheck: true,
    host: 'localhost',
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: {
          compress: {
            warnings: false,
            drop_console: true,
            booleans: false,
            collapse_vars: true,
            reduce_vars: true,
            loops: true,
          },
          output: {
            comments: false,
            beautify: false,
          },
        },
      }),
      new OptimizeCssAssetsPlugin(
        {
          assetNameRegExp: /\.css$/,
          cssProcessor: cssnano({
            zindex: false,
          }),
          cssProcessorOptions: {
            discardComments: {
              removeAll: true,
            },
          },
          canPrint: false,
        },
        {
          copyUnmodified: true,
        },
      ),
    ],
  },
});
