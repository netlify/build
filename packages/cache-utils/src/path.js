const { homedir } = require('os')
const { resolve, join, sep } = require('path')
const { cwd } = require('process')

const { getCacheDir } = require('./dir')

// Find the paths of the file before/after caching
const parsePath = async function(path, cacheDir) {
  const cacheDirA = await getCacheDir(cacheDir)

  const srcPath = resolve(path)
  const { name, base, relPath } = findBase(srcPath)
  const cachePath = join(cacheDirA, name, relPath)
  return { srcPath, cachePath, base }
}

// The cached path is the path relative to the base which can be either the
// current directory, the home directory or the root directory. Each is tried
// in order.
const findBase = function(srcPath) {
  const srcPathA = normalizeWindows(srcPath)
  return BASES.map(({ name, base }) => parseBase(name, base, srcPathA)).find(Boolean)
}

// Windows drives are problematic:
//  - they cannot be used in `relPath` since directories cannot be called `C:`
//    for example.
//  - they make comparing between drives harder
// For the moment, we simply strip them. This does mean two files with the same
// paths but inside different drives would be cached together, which is not
// correct.
// This also means `cache.list()` always assumes the source files are on the
// current drive.
// TODO: fix it.
const normalizeWindows = function(srcPath) {
  return srcPath.replace(WINDOWS_DRIVE_REGEX, '\\')
}

const WINDOWS_DRIVE_REGEX = /^[a-zA-Z]:\\/

// This logic works when `base` and `path` are on different Windows drives
const parseBase = function(name, base, srcPath) {
  if (srcPath === base || !srcPath.startsWith(base)) {
    return
  }

  const relPath = srcPath.replace(base, '')
  return { name, base, relPath }
}

const BASES = [
  { name: 'cwd', base: cwd() },
  { name: 'home', base: homedir() },
  { name: 'root', base: sep },
]

module.exports = { parsePath, BASES }
