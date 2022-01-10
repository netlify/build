import { createRequire } from 'module'

import { async as resolveLib } from 'resolve'

// TODO: use `import.resolve()` once it is available without any experimental
// flags
const require = createRequire(import.meta.url)

// Like `resolvePath()` but does not throw
export const tryResolvePath = async function (path, basedir) {
  try {
    const resolvedPath = await resolvePath(path, basedir)
    return { path: resolvedPath }
  } catch (error) {
    return { error }
  }
}

// This throws if the package cannot be found
export const resolvePath = async function (path, basedir) {
  try {
    return await resolvePathWithBasedir(path, basedir)
    // Fallback.
    // `resolve` sometimes gives unhelpful error messages.
    // https://github.com/browserify/resolve/issues/223
  } catch {
    return require.resolve(path, { paths: [basedir] })
  }
}

// Like `require.resolve()` but as an external library.
// We need to use `new Promise()` due to a bug with `utils.promisify()` on
// `resolve`:
//   https://github.com/browserify/resolve/issues/151#issuecomment-368210310
const resolvePathWithBasedir = function (path, basedir) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line promise/prefer-await-to-callbacks
    resolveLib(path, { basedir }, (error, resolvedPath) => {
      if (error) {
        return reject(error)
      }

      resolve(resolvedPath)
    })
  })
}
