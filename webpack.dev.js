const path = require('path');
const webpack = require('webpack');
const merge = require("webpack-merge");
const common = require("./webpack.common");

const devServerOptions = {
  contentBase: path.join(__dirname, 'dist'),
  compress: true,
  hot: true,
  host: 'localhost',
  port: 3000,
  disableHostCheck: true,
  proxy: {
    '/fund': {
      target: 'http://fundmobapi.eastmoney.com',
      pathRewrite: {
        '^/fund': ''
      },
      changeOrigin: true,
    },
    '/search': {
      target: 'http://fundsuggest.eastmoney.com',
      pathRewrite: {
        '^/search': ''
      },
      changeOrigin: true,
    },
    '/stock': {
      target: 'http://push2.eastmoney.com',
      pathRewrite: {
        '^/stock': ''
      },
      changeOrigin: true,
    }
  }
};

module.exports = merge(common, {
  mode: "development",
  devtool: "cheap-module-source-map",
  devServer: devServerOptions,
  // plugins: [
  //   new webpack.HotModuleReplacementPlugin(),
  // ]
});