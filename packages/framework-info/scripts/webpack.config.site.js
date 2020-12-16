const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

const siteDir = path.resolve(`${__dirname}/../site/react`)
const outDir = path.resolve(`${__dirname}/../dist/react`)

module.exports = {
  entry: `${siteDir}/index.jsx`,
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
    path: outDir,
    filename: 'index.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      minify: false,
      template: `${siteDir}/index.html`,
    }),
  ],
}
