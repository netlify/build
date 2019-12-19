// eslint-disable-next-line node/no-unpublished-require
const { src, dest } = require('gulp')

const build = function() {
  return src('src/**').pipe(dest('build'))
}

module.exports = { build }
