const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const paths = require('./paths');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval',
  devServer: {
    contentBase: paths.build,
    port: 9000,
    disableHostCheck: true,
    host: 'localhost',
  },
  plugins: [],
});
