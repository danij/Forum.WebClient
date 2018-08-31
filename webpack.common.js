const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: {
        app: './src/app.ts',
        others: './src/others.ts',
        styles: './src/styles.ts',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'node_modules/katex/dist/katex.min.css'),
                to: path.resolve(__dirname, 'dist/katex.min.css')
            },
            {
                from: path.resolve(__dirname, 'node_modules/katex/dist/fonts'),
                to: path.resolve(__dirname, 'dist/fonts')
            },
            {
                from: path.resolve(__dirname, 'index.html'),
                to: path.resolve(__dirname, 'dist/index.html')
            },
            {
                from: path.resolve(__dirname, 'config/config.js'),
                to: path.resolve(__dirname, 'dist/config/config.js')
            },
            {
                from: path.resolve(__dirname, 'doc'),
                to: path.resolve(__dirname, 'dist/doc')
            }
        ]),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        })
    ],
    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/, use: [{
                    loader: 'ts-loader'
                }]
            },
            {
                test: /\.(png|woff(2)?|eot|ttf|svg)$/,

                use: [{
                    loader: 'file-loader',

                    options: {
                        name: '[name].[ext]',
                        publicPath: 'img/',
                        outputPath: 'img/',
                    }
                }]
            },
            {
                test: /\.css$/, use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader'
                }]
            },
            {
                test: /\.less$/, use: [MiniCssExtractPlugin.loader, {
                    loader: 'css-loader'
                }, {
                    loader: 'less-loader'
                }]
            }
        ]
    }
};
