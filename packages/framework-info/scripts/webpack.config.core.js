const path = require('path')

module.exports = {
  entry: path.resolve(`${__dirname}/../src/core.js`),
  devtool: 'source-map',
  output: {
    path: path.resolve(`${__dirname}/../dist`),
    filename: 'index.js',
    library: 'frameworkInfo',
    libraryTarget: 'umd',
  },
  resolve: {
    fallback: { path: require.resolve('path-browserify') },
  },
}
