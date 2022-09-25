const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: ['./src/index.ts'],
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        fallback: {
            "fs": false,
            "tls": false,
            "os": false,
            "vm": false,
            "console": false,
            "assert": false,
            "net": false,
            "path": false,
            "zlib": false,
            "http": false,
            "https": false,
            "stream": false,
            "crypto": false,
            "crypto-browserify": false        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$|\.jsx?$/, include: path.join(__dirname, '../src'), loader: 'ts-loader'
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: 'src/index.html' }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/res', to: 'res' },
                { from: 'src/favicon.ico', to: '' }
            ]
        })
    ]
}
