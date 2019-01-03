const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BUILD_DIR = path.resolve(__dirname, 'client/public');
const APP_DIR = path.resolve(__dirname, 'client/src');
//const webpackDashboard = require('webpack-dashboard/plugin');

const config = {
    entry: {
        'landingIndex': path.join(APP_DIR, 'pages/landingPage/landingIndex.jsx'),
        'loggedIndex': path.join(APP_DIR, 'pages/loggedPage/loggedIndex.jsx'),
    },
    mode: 'development',
    output: {
        path: BUILD_DIR,
        filename: 'js/bundle_[name].js',
    },
    resolve: {
        modules: ['node_modules', APP_DIR],
        extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx'],
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: APP_DIR,
                loader: 'babel-loader',
                query: {
                    presets: ['@babel/react', '@babel/env'],
                    plugins: ['@babel/plugin-proposal-class-properties'],
                },
            },
            {
                test: /\.css$/,
                use: ['css-loader'],
            },
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'static/media/[name].[hash:8].[ext]',
                },
            },
            {
                test: /\.svg$/,
                exclude: /node_modules/,
                loader: 'svg-react-loader',
            }
        ],
    },
    node: {
        fs: 'empty',
    },
    plugins: [
        //new webpackDashboard(),

        new HtmlWebpackPlugin({
            chunks: ['landingIndex'],
            filename: 'index/landingIndex.ejs',
            template: '!!html-loader!client/src/pages/template.ejs',
        }),

        new HtmlWebpackPlugin({
            chunks: ['loggedIndex'],
            filename: 'index/loggedIndex.ejs',
            template: '!!html-loader!client/src/pages/template.ejs',
        }),
    ],
};
module.exports = config;
