'use strict'

const { version: nodeVersion } = require('process')

const pathExists = require('path-exists')
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
// We try not to use `resolve` because it gives unhelpful error messages.
//   https://github.com/browserify/resolve/issues/223
// Ideally we would use async I/O but that is not an option with
// `require.resolve()`
const resolvePath = async function (path, basedir) {
  if (gteVersion(nodeVersion, REQUEST_RESOLVE_MIN_VERSION)) {
    const filePath = require.resolve(path, { paths: [basedir] })

    // There are some bugs in `require.resolve()` which make it return
    // non-existing files. Those bugs do not exist in `resolve`.
    if (await pathExists(filePath)) {
      return filePath
    }
  }

  return resolvePathFallback(path, basedir)
}

// `require.resolve()` option `paths` was introduced in Node 8.9.0
const REQUEST_RESOLVE_MIN_VERSION = '8.9.0'

// Like `require.resolve()` but works with Node <8.9.0
// We need to use `new Promise()` due to a bug with `utils.promisify()` on
// `resolve`:
//   https://github.com/browserify/resolve/issues/151#issuecomment-368210310
const resolvePathFallback = function (path, basedir) {
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
