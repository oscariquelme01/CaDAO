const { merge } = require('webpack-merge')
const common = require('./webpack.common')
// const WebpackObfuscator = require('webpack-obfuscator')

const prod = {
  mode: 'production',
  stats: 'errors-warnings',
  output: {
    filename: '[name].[contenthash].bundle.js',
    chunkFilename: '[name].[contenthash].chunk.js'
  },
}

module.exports = merge(common, prod)
