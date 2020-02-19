const pathExists = require('path-exists')
const del = require('del')

const { parsePath } = require('./path')
const { getManifestInfo, writeManifest, removeManifest, isExpired } = require('./manifest')
const { moveCacheFile } = require('./fs')
const { getCacheDir } = require('./dir')
const { list } = require('./list')

// Cache a file
const saveOne = async function(path, { move = DEFAULT_MOVE, ttl = DEFAULT_TTL, digests = [] } = {}) {
  const { srcPath, cachePath, base } = await parsePath(path)

  if (!(await pathExists(srcPath))) {
    return false
  }

  const { manifestInfo, identical } = await getManifestInfo({ srcPath, cachePath, move, ttl, digests, base })
  if (identical) {
    return false
  }

  await del(cachePath, { force: true })
  await moveCacheFile(srcPath, cachePath, move)
  await writeManifest(manifestInfo)

  return true
}

// Restore a cached file
const restoreOne = async function(path, { move = DEFAULT_MOVE } = {}) {
  const { srcPath, cachePath } = await parsePath(path)

  if (!(await pathExists(cachePath))) {
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
const removeOne = async function(path) {
  const { cachePath } = await parsePath(path)

  if (!(await pathExists(cachePath))) {
    return false
  }

  await del(cachePath, { force: true })
  await removeManifest(cachePath)

  return true
}

// Check if a file is cached
const hasOne = async function(path) {
  const { cachePath } = await parsePath(path)

  return (await pathExists(cachePath)) && !(await isExpired(cachePath))
}

const DEFAULT_MOVE = false
const DEFAULT_TTL = undefined

// Allow each of the main functions to take either a single path or an array of
// paths as arguments
const allowMany = async function(func, paths, ...args) {
  if (!Array.isArray(paths)) {
    return func(paths, ...args)
  }

  const results = await Promise.all(paths.map(path => func(path, ...args)))
  return results.some(Boolean)
}

const save = allowMany.bind(null, saveOne)
const restore = allowMany.bind(null, restoreOne)
const remove = allowMany.bind(null, removeOne)
const has = allowMany.bind(null, hasOne)

module.exports = { save, restore, remove, has, list, getCacheDir }
