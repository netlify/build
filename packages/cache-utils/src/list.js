const { join } = require('path')

const readdirp = require('readdirp')

const { getCacheDir } = require('./dir')
const { BASES } = require('./path')
const { isManifest } = require('./manifest')

// List all cached files
const list = async function({ cacheDir } = {}) {
  const cacheDirA = await getCacheDir(cacheDir)
  const files = await Promise.all(BASES.map(baseInfo => listBase(baseInfo, cacheDirA)))
  const filesA = files.flat()
  return filesA
}

// TODO: the returned paths are missing the Windows drive
const listBase = async function({ name, base }, cacheDir) {
  const files = await readdirp.promise(`${cacheDir}/${name}`, { fileFilter })
  const filesA = files.map(({ path }) => join(base, path))
  return filesA
}

const fileFilter = function({ basename }) {
  return !isManifest(basename)
}

module.exports = { list }
