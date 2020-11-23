const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const pkgStore = require('pkg-store');

const init = require('./scripts/init');
init();

const pkgData = new pkgStore(process.cwd()).read();

function getName() {
  return process.env.NODE_ENV !== 'development' ?
    JSON.stringify(pkgData.name_ch) :
    JSON.stringify(`${pkgData.name_ch}-debug`);
}

function getVersion() {
  return process.env.NODE_ENV !== 'development' ?
    JSON.stringify(pkgData.version) :
    JSON.stringify('1.0.0');
}

module.exports = {
  entry: {
    popup: path.join(__dirname, 'src/popup.tsx'),
    option: path.join(__dirname, 'src/option.tsx'),
    background: path.join(__dirname, 'src/background.ts'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'js/[name].js',
  },
  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        use: ['babel-loader', 'ts-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [{
            loader: 'style-loader' // Creates style nodes from JS strings
          },
          {
            loader: 'css-loader', // Translates CSS into CommonJS
            options: {
              modules: {
                localIdentName: '[local]_[hash:base64:5]'
              }
            },
          },
          {
            loader: 'sass-loader' // Compiles Sass to CSS
          }
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192,
            outputPath: './image'
          }
        }]
      },
      {
        test: /\.(ttf|eot|svg|woff|woff2)$/,
        use: 'url-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', 'jsx']
  },
  plugins: [
    new webpack.DefinePlugin({
      PRODUCT: getName(),
      VERSION: getVersion(),
      DEV: JSON.stringify(process.env.NODE_ENV === 'development'),
    }),
    new HtmlWebpackPlugin({
      template: './template/index.html',
      filename: 'popup.html',
      title: '大牛基金助手',
      chunks: ['popup'],
    }),
    new HtmlWebpackPlugin({
      template: './template/index.html',
      filename: 'option.html',
      title: '大牛基金助手-选项',
      chunks: ['option'],
    }),
    new HtmlWebpackPlugin({
      template: './template/index.html',
      filename: 'background.html',
      title: '大牛基金助手-后台',
      chunks: ['background'],
    }),
  ],
};