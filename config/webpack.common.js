const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const paths = require('./paths');

module.exports = {
  entry: {
    main: `${paths.src}/main.js`,
  },
  resolve: {
    alias: {
      '@images': `${paths.src}/images`,
      '@translate': `${paths.src}/js/translate`,
      '@game': `${paths.src}/js/components/Game`,
      assets: paths.public,
    },
  },
  output: {
    path: paths.build,
    publicPath: '/',
    filename: '[name].[contenthash].js',
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  module: {
    rules: [
      // JavaScript: Use Babel to transpile JavaScript files
      { test: /\.js$/, use: ['babel-loader'] },
      {
        test: /(\.css|\.scss|\.sass)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      // Images: Copy image files to build folder
      { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource' },

      // Fonts and SVGs: Inline files
      { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: 'asset/inline' },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.public,
          to: 'assets',
          globOptions: {
            ignore: ['*.DS_Store'],
          },
          noErrorOnMissing: true,
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[chunkhash].min.css',
      chunkFilename: 'styles/[name].[chunkhash].css',
    }),
    new HtmlWebpackPlugin({
      title: 'Boom',
      favicon: `${paths.src}/images/favicon.ico`,
      template: `${paths.src}/template.html`, // template file
      filename: 'index.html', // output file
    }),
  ],
};
