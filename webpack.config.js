const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/app.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'source-map',
    plugins: [
        // new webpack.optimize.UglifyJsPlugin()
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'node_modules/jquery/dist/jquery.min.js'),
                to: path.resolve(__dirname, 'dist/jquery.min.js')
            },
            {
                from: path.resolve(__dirname, 'node_modules/uikit/dist/js/uikit.min.js'),
                to: path.resolve(__dirname, 'dist/uikit.min.js')
            },
            {
                from: path.resolve(__dirname, 'node_modules/uikit/dist/css/uikit.min.css'),
                to: path.resolve(__dirname, 'dist/uikit.min.css')
            },
            {
                from: path.resolve(__dirname, 'node_modules/uikit/dist/js/uikit-icons.min.js'),
                to: path.resolve(__dirname, 'dist/uikit-icons.min.js')
            },
            {
                from: path.resolve(__dirname, 'node_modules/es6-promise/dist/es6-promise.auto.min.js'),
                to: path.resolve(__dirname, 'dist/es6-promise.auto.min.js')
            },
            {
                from: path.resolve(__dirname, 'node_modules/remarkable/dist/remarkable.min.js'),
                to: path.resolve(__dirname, 'dist/remarkable.min.js')
            },
            {
                from: path.resolve(__dirname, 'node_modules/highlight.js/lib/highlight.pack.js'),
                to: path.resolve(__dirname, 'dist/highlight.pack.js')
            },
            {
                from: path.resolve(__dirname, 'node_modules/highlight.js/styles/default.css'),
                to: path.resolve(__dirname, 'dist/highlight-default.css')
            },
            {
                from: path.resolve(__dirname, 'node_modules/katex/dist/katex.min.js'),
                to: path.resolve(__dirname, 'dist/katex.min.js')
            },
            {
                from: path.resolve(__dirname, 'node_modules/katex/dist/katex.min.css'),
                to: path.resolve(__dirname, 'dist/katex.min.css')
            },
            {
                from: path.resolve(__dirname, 'node_modules/katex/dist/contrib/auto-render.min.js'),
                to: path.resolve(__dirname, 'dist/auto-render.min.js')
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
            {test: /\.ts$/, loader: 'ts-loader'},
            // {test: require.resolve('jquery/dist/jquery.min'), loader: 'expose-loader?jQuery!expose-loader?$'},
            // {test: require.resolve('uikit/dist/js/uikit.min'), loader: 'expose-loader?UIkit!expose-loader?$'}
        ]
    }
};
