const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/app.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'source-map',
    plugins: [
        // new webpack.optimize.UglifyJsPlugin()
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
}
