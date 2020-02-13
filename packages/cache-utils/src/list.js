const { join } = require('path')

const readdirp = require('readdirp')

const { getCacheDir } = require('./dir')
const { BASES } = require('./path')
const { isManifest } = require('./manifest')

// List all cached files
const list = async function() {
  const cacheDir = await getCacheDir()
  const files = await Promise.all(BASES.map(baseInfo => listBase(baseInfo, cacheDir)))
  const filesA = files.flat()
  return filesA
}

const listBase = async function({ name, base }, cacheDir) {
  const files = await readdirp.promise(`${cacheDir}/${name}`, { fileFilter })
  const filesA = files.map(({ path }) => join(base, path))
  return filesA
}

const fileFilter = function({ basename }) {
  return !isManifest(basename)
}

module.exports = { list }
