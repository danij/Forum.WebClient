const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        app: './src/app.ts',
        others: './src/others.ts'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'node_modules/highlight.js/lib/highlight.pack.js'),
                to: path.resolve(__dirname, 'dist/highlight.pack.js')
            }
        ])
    ],
    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js']
    },
    module: {
        rules: [
            {test: /\.ts$/, loader: 'ts-loader'},
            {
                test: /\.(png|woff(2)?|eot|ttf|svg)$/, loader: 'file-loader', options: {
                    name: '[name].[ext]',
                    publicPath: 'dist/'
                }
            },
            {test: /\.css$/, loader: ['style-loader', 'css-loader']}
        ]
    }
};
