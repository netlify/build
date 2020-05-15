const resolve = require('resolve')

// Like `require.resolve()` but works with a custom base directory.
// We need to use `new Promise()` due to a bug with `utils.promisify()` on
// `resolve`:
//   https://github.com/browserify/resolve/issues/151#issuecomment-368210310
const resolvePath = function(path, basedir) {
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
