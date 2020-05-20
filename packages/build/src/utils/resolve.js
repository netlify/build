const { version: nodeVersion } = require('process')

const resolve = require('resolve')
const { gte: gteVersion } = require('semver')

// This throws if the package cannot be found
// We try not to use `resolve` because it gives unhelpful error messages.
//   https://github.com/browserify/resolve/issues/223
// Ideally we would use async I/O but that is not an option with
// `require.resolve()`
const resolvePath = function(path, basedir) {
  if (gteVersion(nodeVersion, REQUEST_RESOLVE_MIN_VERSION)) {
    return require.resolve(path, { paths: [basedir] })
  }

  return resolvePathFallback(path, basedir)
}

// `require.resolve()` option `paths` was introduced in Node 8.9.0
const REQUEST_RESOLVE_MIN_VERSION = '8.9.0'

// Like `require.resolve()` but works with Node <8.9.0
// TODO: remove after dropping support for Node <8.9.0
// We need to use `new Promise()` due to a bug with `utils.promisify()` on
// `resolve`:
//   https://github.com/browserify/resolve/issues/151#issuecomment-368210310
const resolvePathFallback = function(path, basedir) {
  return new Promise((success, reject) => {
    resolve(path, { basedir }, (error, resolvedPath) => {
      if (error) {
        return reject(error)
      }

      success(resolvedPath)
    })
  })
}

module.exports = { resolvePath }
