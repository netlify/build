const { join } = require('path')

const readdirp = require('readdirp')

const { getCacheDir } = require('./dir')
const { isManifest } = require('./manifest')
const { BASES } = require('./path')

// List all cached files
const list = async function({ cacheDir, mode } = {}) {
  const cacheDirA = await getCacheDir({ cacheDir, mode })
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
