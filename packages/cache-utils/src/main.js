const pathExists = require('path-exists')

const { parsePath } = require('./path')
const { getManifestInfo, writeManifest, removeManifest, isExpired } = require('./manifest')
const { moveCacheFile, removeCacheFile } = require('./fs')

// Cache a file
const save = async function(path, { move = DEFAULT_MOVE, ttl = DEFAULT_TTL } = {}) {
  const { srcPath, cachePath, base } = await parsePath(path)

  if (!(await pathExists(srcPath))) {
    return false
  }

  const { manifestInfo, identical } = await getManifestInfo(srcPath, cachePath, ttl, base)
  if (identical) {
    return false
  }

  await removeCacheFile(cachePath)
  await moveCacheFile(srcPath, cachePath, move)
  await writeManifest(manifestInfo)

  return true
}

// Restore a cached file
const restore = async function(path, { move = DEFAULT_MOVE } = {}) {
  const { srcPath, cachePath } = await parsePath(path)

  if (await pathExists(srcPath)) {
    return false
  }

  if (!(await pathExists(cachePath))) {
    return false
  }

  if (await isExpired(srcPath, cachePath)) {
    return false
  }

  await moveCacheFile(cachePath, srcPath, move)

  return true
}

// Remove the cache of a file
const remove = async function(path) {
  const { cachePath } = await parsePath(path)

  if (!(await pathExists(cachePath))) {
    return false
  }

  await removeCacheFile(cachePath)
  await removeManifest(cachePath)

  return true
}

// Check if a file is cached
const has = async function(path) {
  const { srcPath, cachePath } = await parsePath(path)

  return (await pathExists(cachePath)) && !(await isExpired(srcPath, cachePath))
}

const DEFAULT_MOVE = false
const DEFAULT_TTL = undefined

module.exports = { save, restore, remove, has }
