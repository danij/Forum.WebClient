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
    devtool: 'source-map',
    plugins: [
        // new webpack.optimize.UglifyJsPlugin({
        //     sourceMap: true
        // }),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'node_modules/uikit/dist/css/uikit.min.css'),
                to: path.resolve(__dirname, 'dist/uikit.min.css')
            },
            {
                from: path.resolve(__dirname, 'node_modules/highlight.js/styles/default.css'),
                to: path.resolve(__dirname, 'dist/highlight-default.css')
            },
            {
                from: path.resolve(__dirname, 'node_modules/highlight.js/lib/highlight.pack.js'),
                to: path.resolve(__dirname, 'dist/highlight.pack.js')
            },
            {
                from: path.resolve(__dirname, 'node_modules/katex/dist/katex.min.css'),
                to: path.resolve(__dirname, 'dist/katex.min.css')
            },
            {
                context: path.resolve(__dirname, 'node_modules/katex/dist/fonts'),
                from: '*',
                to: path.resolve(__dirname, 'dist/fonts')
            }
        ])
    ],
    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js']
    },
    module: {
        loaders: [
            {test: /\.ts$/, loader: 'ts-loader'}
        ]
    }
};
