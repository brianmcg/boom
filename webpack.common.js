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
      test: /(\.jsx|\.js)$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['es2015'],
        },
      },
      exclude: /node_modules/,
      include: '/src/',
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
      from: path.resolve(__dirname, 'src/assets/manifest'),
      to: path.resolve(__dirname, 'dist/assets/manifest'),

    }, {
      from: path.resolve(__dirname, 'src/assets/media'),
      to: path.resolve(__dirname, 'dist/assets/media'),
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
