const { homedir } = require('os')
const { resolve, join, sep } = require('path')
const { cwd: getCwd } = require('process')

const { getCacheDir } = require('./dir')

// Find the paths of the file before/after caching
const parsePath = async function({ path, cacheDir, mode }) {
  const srcPath = getSrcPath(path)
  const cachePath = await getCachePath({ srcPath, cacheDir, mode })
  return { srcPath, cachePath }
}

// Retrieve absolute path to the local file to cache/restore
const getSrcPath = function(path) {
  const cwd = getCwd()
  const srcPath = resolve(cwd, path)
  checkSrcPath(srcPath, cwd)
  return srcPath
}

// Caching the whole repository creates many issues:
//  - It caches many directories that are not related to Gatsby but take lots of
//    space, such as node_modules
//  - It caches directories that are not meant to restored across builds. For
//    example .git (beside being big).
//  - It undoes any build operations inside the repository that might have
//    happened before this plugin starts restoring the cache, leading to
//    conflicts with other plugins, Netlify Build or the buildbot.
const checkSrcPath = function(srcPath, cwd) {
  if (isParentPath(srcPath, cwd)) {
    throw new Error(`Cannot cache ${srcPath} because it is the current directory (${cwd}) or a parent directory`)
  }
}

// Note: srcPath and cwd are already normalized and absolute
const isParentPath = function(srcPath, cwd) {
  return `${cwd}${sep}`.startsWith(`${srcPath}${sep}`)
}

const getCachePath = async function({ srcPath, cacheDir, mode }) {
  const cacheDirA = await getCacheDir({ cacheDir, mode })
  const { name, relPath } = findBase(srcPath)
  const cachePath = join(cacheDirA, name, relPath)
  return cachePath
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
  return { name, relPath }
}

const BASES = [
  { name: 'cwd', base: getCwd() },
  { name: 'home', base: homedir() },
  { name: 'root', base: sep },
]

module.exports = { parsePath, BASES }
