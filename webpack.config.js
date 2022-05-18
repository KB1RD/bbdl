const path = require('path');

const webpack = require('webpack');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyPlugin = require('copy-webpack-plugin');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const DIST_DIR = path.resolve(__dirname, 'dist');
const STATIC_DIR = path.resolve(__dirname, 'static');
const SRC_DIR = path.resolve(__dirname, 'src');
const ASSET_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'
];

module.exports = {
  mode: IS_PRODUCTION ? 'production' : 'development',
  
  // We're only building a content script
  output: {
    filename: 'content.js',
    path: DIST_DIR,
  },
  entry: path.join(SRC_DIR, 'content.js'),
  
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { modules: false }],
                ...(IS_PRODUCTION ? ['minify'] : [])
              ],
              plugins: [
                ['@babel/plugin-transform-react-jsx', { 'pragma': 'createElement' }]
              ]
            }
          }
        ]
      },
      {
        test: new RegExp('\.(' + ASSET_EXTENSIONS.join('|') + ')$'),
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'assets/'
          }
        }
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: STATIC_DIR, to: DIST_DIR }]
    }),
    process.env.ANALYZE_BUNDLE ? new BundleAnalyzerPlugin({
      generateStatsFile: true,
      openAnalyzer: true
    }) : new Function(),
    new CleanWebpackPlugin()
  ],
  devtool: IS_PRODUCTION ? undefined : 'inline-source-map'
};
