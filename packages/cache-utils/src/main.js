const pathExists = require('path-exists')

const { parsePath } = require('./path')
const { getManifestInfo, writeManifest, removeManifest, isExpired } = require('./manifest')
const { moveCacheFile, removeCacheFile } = require('./fs')

// Cache a file
const save = async function(path, { move = DEFAULT_MOVE, ttl = DEFAULT_TTL } = {}) {
  const { srcPath, cachePath, base } = await parsePath(path)

  if (!(await pathExists(srcPath))) {
    return
  }

  const { manifestInfo, identical } = await getManifestInfo(srcPath, cachePath, ttl, base)
  if (identical) {
    return
  }

  await removeCacheFile(cachePath)
  await moveCacheFile(srcPath, cachePath, move)
  await writeManifest(manifestInfo)
}

// Restore a cached file
const restore = async function(path, { move = DEFAULT_MOVE } = {}) {
  const { srcPath, cachePath } = await parsePath(path)

  if (await pathExists(srcPath)) {
    return
  }

  if (!(await pathExists(cachePath))) {
    return
  }

  if (await isExpired(srcPath, cachePath)) {
    return
  }

  await moveCacheFile(cachePath, srcPath, move)
}

// Remove the cache of a file
const remove = async function(path) {
  const { cachePath } = await parsePath(path)

  await removeCacheFile(cachePath)
  await removeManifest(cachePath)
}

// Check if a file is cached
const has = async function(path) {
  const { srcPath, cachePath } = await parsePath(path)

  return (await pathExists(cachePath)) && !(await isExpired(srcPath, cachePath))
}

const DEFAULT_MOVE = false
const DEFAULT_TTL = undefined

module.exports = { save, restore, remove, has }
