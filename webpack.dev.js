const path = require('path');
const webpack = require('webpack');
const merge = require("webpack-merge");
const common = require("./webpack.common");

const devServerOptions = {
  compress: true,
  host: 'localhost',
  port: 3000,
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
      target: 'http://push2.eastmoney.com/api',
      pathRewrite: {
        '^/stock': ''
      },
      changeOrigin: true,
    }
  }
};

module.exports = merge(common, {
  mode: "development",
  devtool: "eval-cheap-source-map",
  devServer: devServerOptions,
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ]
});