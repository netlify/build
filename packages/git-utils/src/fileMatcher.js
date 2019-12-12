// vendored from https://github.com/paulmelnikow/chainsmoker
const micromatch = require('micromatch')
const mapValues = require('lodash.mapvalues')

const isExclude = p => p.startsWith('!')

module.exports = function fileMatcher(keyedPaths) {
  function matchPatterns(patterns) {
    return mapValues(keyedPaths, paths => {
      const excludePatterns = patterns.filter(p => isExclude(p))
      const includePatterns = patterns.filter(p => !isExclude(p))
      const included = includePatterns.reduce((accum, pattern) => accum.concat(micromatch.match(paths, pattern)), [])
      return excludePatterns.reduce((accum, pattern) => micromatch.match(accum, pattern), included)
    })
  }
  function finalize(keyedPaths) {
    return Object.assign(
      Object.assign(
        {},
        mapValues(keyedPaths, paths => paths.length > 0),
      ),
      { getKeyedPaths: () => keyedPaths },
    )
  }
  return (...patterns) => finalize(matchPatterns(patterns))
}
