const { homedir } = require('os')
const { relative, resolve, normalize } = require('path')
const { cwd } = require('process')

const { getCacheDir } = require('./dir')

// Find the paths of the file before/after caching
const parsePath = async function(path) {
  const cacheDir = await getCacheDir()

  const { name, base, relPath } = findBase(path)
  const srcPath = resolve(base, relPath)
  const cachePath = resolve(cacheDir, name, relPath)
  return { srcPath, cachePath, base }
}

// The cached path is the path relative to the base which can be either the
// current directory, the home directory or the root directory. Each is tried
// in order.
const findBase = function(path) {
  return BASES.map(({ name, base }) => parseBase(name, base, path)).find(isChildPath)
}

const parseBase = function(name, base, path) {
  const relPath = relative(base, path)
  return { name, base, relPath }
}

const BASES = [
  { name: 'cwd', base: cwd() },
  { name: 'home', base: homedir() },
  { name: 'root', base: normalize('/') },
]

const isChildPath = function({ relPath }) {
  return !relPath.startsWith('..') && relPath !== ''
}

module.exports = { parsePath, BASES }
