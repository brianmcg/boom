const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { HashedModuleIdsPlugin } = require('webpack');
const autoprefixer = require('autoprefixer');

module.exports = {
  entry: {
    main: path.resolve(__dirname, 'src/assets/scripts/main.js'),
  },
  resolve: {
    alias: {
      root: path.resolve(__dirname, 'src/assets/scripts'),
      game: path.resolve(__dirname, 'src/assets/scripts/components/Game'),
      manual: path.resolve(__dirname, 'src/assets/scripts/components/GameManual'),
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'assets/scripts/[name].[chunkhash].js',
    chunkFilename: 'assets/scripts/[name].[chunkhash].js',
  },
  optimization: {
    runtimeChunk: {
      name: 'manifest',
    },
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules\/(.*)\.js/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  module: {
    rules: [{
      test: /\.m?js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [[
            '@babel/preset-env', {
              targets: {
                esmodules: true,
              },
            },
          ]],
          plugins: [[
            '@babel/plugin-transform-react-jsx', {
              pragma: 'h',
              pragmaFrag: 'Fragment',
            },
          ]],
        },
      },
      exclude: path.resolve(__dirname, 'node_modules/'),
      include: path.resolve(__dirname, 'src/'),
    }, {
      test: /(\.css|\.scss|\.sass)$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader', {
        loader: 'postcss-loader',
        options: {
          plugins: () => [autoprefixer({
            browsers: ['> 1%', 'last 2 versions'],
          })],
        },
      }],
    }, {
      test: /\.(gif|jpg|png|ico)\??.*$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 1024,
          name: '[name].[ext]',
          publicPath: '../../',
          outputPath: 'assets/styles/',
        },
      },
    }, {
      test: /\.(svg|woff|otf|ttf|eot)\??.*$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 1024,
          name: '[name].[ext]',
          publicPath: '../../',
          outputPath: 'assets/styles/',
        },
      },
    }, {
      test: /\.html$/,
      use: {
        loader: 'html-loader',
        options: {
          minimize: true,
          removeComments: false,
          collapseWhitespace: false,
        },
      },
    }],
  },
  plugins: [
    new HashedModuleIdsPlugin(),
    new CleanWebpackPlugin(['dist'], {
      root: '',
      verbose: true,
      dry: false,
    }),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, 'src/assets/data'),
      to: path.resolve(__dirname, 'dist/assets/data'),
    }, {
      from: path.resolve(__dirname, 'src/assets/fonts'),
      to: path.resolve(__dirname, 'dist/assets/fonts'),
    }, {
      from: path.resolve(__dirname, 'src/assets/manifest'),
      to: path.resolve(__dirname, 'dist/assets/manifest'),
    }]),
    new MiniCssExtractPlugin({
      filename: 'assets/styles/[name].[chunkhash].min.css',
      chunkFilename: 'assets/styles/[name].[chunkhash].css',
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body',
      hash: false,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),
  ],
};
