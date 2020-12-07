'use strict'

const { version: nodeVersion } = require('process')

const resolveLib = require('resolve')
const { gte: gteVersion } = require('semver')

// Like `resolvePath()` but does not throw
const tryResolvePath = async function (path, basedir) {
  try {
    const resolvedPath = await resolvePath(path, basedir)
    return { path: resolvedPath }
  } catch (error) {
    return { error }
  }
}

// This throws if the package cannot be found
const resolvePath = async function (path, basedir) {
  try {
    return await resolvePathWithBasedir(path, basedir)
    // Fallback.
    // `resolve` sometimes gives unhelpful error messages.
    // https://github.com/browserify/resolve/issues/223
  } catch (error) {
    if (gteVersion(nodeVersion, REQUEST_RESOLVE_MIN_VERSION)) {
      return require.resolve(path, { paths: [basedir] })
    }

    throw error
  }
}

// `require.resolve()` option `paths` was introduced in Node 8.9.0
const REQUEST_RESOLVE_MIN_VERSION = '8.9.0'

// Like `require.resolve()` but as an external library.
// We need to use `new Promise()` due to a bug with `utils.promisify()` on
// `resolve`:
//   https://github.com/browserify/resolve/issues/151#issuecomment-368210310
const resolvePathWithBasedir = function (path, basedir) {
  return new Promise((resolve, reject) => {
    resolveLib(path, { basedir }, (error, resolvedPath) => {
      if (error) {
        return reject(error)
      }

      resolve(resolvedPath)
    })
  })
}

module.exports = { tryResolvePath, resolvePath }
