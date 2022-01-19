import { fileURLToPath } from 'url'

import HtmlWebpackPlugin from 'html-webpack-plugin'

const SITE_DIR = new URL('../site/react/', import.meta.url)
const SITE_ENTRY_JSX = fileURLToPath(new URL('index.jsx', SITE_DIR))
const SITE_ENTRY_HTML = fileURLToPath(new URL('index.html', SITE_DIR))
const OUT_DIR = fileURLToPath(new URL('../dist/react/', import.meta.url))

const webpackConfig = {
  entry: SITE_ENTRY_JSX,
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    path: OUT_DIR,
    filename: 'index.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      minify: false,
      template: SITE_ENTRY_HTML,
    }),
  ],
}

export default webpackConfig
