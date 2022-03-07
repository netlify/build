import del from 'del'

import { getCacheDir } from './dir.js'
import { moveCacheFile, hasFiles } from './fs.js'
import { list } from './list.js'
import { getManifestInfo, writeManifest, removeManifest, isExpired } from './manifest.js'
import { parsePath } from './path.js'

export { getCacheDir } from './dir.js'
export { list } from './list.js'

// Cache a file
const saveOne = async function (
  path,
  { move = DEFAULT_MOVE, ttl = DEFAULT_TTL, digests = [], cacheDir, cwd: cwdOpt } = {},
) {
  const { srcPath, cachePath } = await parsePath({ path, cacheDir, cwdOpt })

  if (!(await hasFiles(srcPath))) {
    return false
  }

  const { manifestInfo, identical } = await getManifestInfo({ cachePath, move, ttl, digests })
  if (identical) {
    return true
  }

  await del(cachePath, { force: true })
  await moveCacheFile(srcPath, cachePath, move)
  await writeManifest(manifestInfo)

  return true
}

// Restore a cached file
const restoreOne = async function (path, { move = DEFAULT_MOVE, cacheDir, cwd: cwdOpt } = {}) {
  const { srcPath, cachePath } = await parsePath({ path, cacheDir, cwdOpt })

  if (!(await hasFiles(cachePath))) {
    return false
  }

  if (await isExpired(cachePath)) {
    return false
  }

  await del(srcPath, { force: true })
  await moveCacheFile(cachePath, srcPath, move)

  return true
}

// Remove the cache of a file
const removeOne = async function (path, { cacheDir, cwd: cwdOpt } = {}) {
  const { cachePath } = await parsePath({ path, cacheDir, cwdOpt })

  if (!(await hasFiles(cachePath))) {
    return false
  }

  await del(cachePath, { force: true })
  await removeManifest(cachePath)

  return true
}

// Check if a file is cached
const hasOne = async function (path, { cacheDir, cwd: cwdOpt } = {}) {
  const { cachePath } = await parsePath({ path, cacheDir, cwdOpt })

  return (await hasFiles(cachePath)) && !(await isExpired(cachePath))
}

const DEFAULT_MOVE = false
const DEFAULT_TTL = undefined

// Allow each of the main functions to take either a single path or an array of
// paths as arguments
const allowMany = async function (func, paths, ...args) {
  if (!Array.isArray(paths)) {
    return func(paths, ...args)
  }

  const results = await Promise.all(paths.map((path) => func(path, ...args)))
  return results.some(Boolean)
}

export const save = allowMany.bind(null, saveOne)
export const restore = allowMany.bind(null, restoreOne)
export const remove = allowMany.bind(null, removeOne)
export const has = allowMany.bind(null, hasOne)

// Change `opts` default values
export const bindOpts = function (opts) {
  return {
    save: (paths, optsA) => save(paths, { ...opts, ...optsA }),
    restore: (paths, optsA) => restore(paths, { ...opts, ...optsA }),
    remove: (paths, optsA) => remove(paths, { ...opts, ...optsA }),
    has: (paths, optsA) => has(paths, { ...opts, ...optsA }),
    list: (optsA) => list({ ...opts, ...optsA }),
    getCacheDir: (optsA) => getCacheDir({ ...opts, ...optsA }),
  }
}
