const CleanWebpackPlugin = require('clean-webpack-plugin');
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
      {
        test: /\.m?js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    esmodules: true,
                  },
                },
              ],
            ],
          },
        },
        // exclude: path.resolve(__dirname, 'node_modules/'),
        // include: path.resolve(__dirname, 'src/'),
      },
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
      {
        test: /\.(woff|ttf)\??.*$/,
        use: {
          loader: 'file-loader',
          options: {
            limit: 1024,
            name: '[name].[ext]',
            outputPath: 'fonts',
          },
        },
      },
      {
        test: /\.(gif)\??.*$/,
        use: {
          loader: 'file-loader',
          options: {
            limit: 1024,
            name: '[name].[ext]',
            outputPath: 'images',
          },
        },
      },
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader',
          options: {
            minimize: true,
            removeComments: false,
            collapseWhitespace: false,
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: '',
      verbose: true,
      dry: false,
    }),
    new CopyWebpackPlugin([
      {
        from: `${paths.src}/fonts`,
        to: `${paths.build}/fonts`,
      },
      {
        from: `${paths.src}/images`,
        to: `${paths.build}/images`,
      },
      {
        from: paths.public,
        to: `${paths.build}/assets`,
      },
    ]),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[chunkhash].min.css',
      chunkFilename: 'styles/[name].[chunkhash].css',
    }),
    new HtmlWebpackPlugin({
      template: `${paths.src}/template.html`,
      inject: 'body',
      hash: false,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),
  ],
};
