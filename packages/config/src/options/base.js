const { realpath } = require('fs')
const { dirname, relative, sep } = require('path')
const { promisify } = require('util')

const pathExists = require('path-exists')

const pRealpath = promisify(realpath)

// Retrieve `base` override.
// This uses any directory below `repositoryRoot` and above (or equal to)
// `cwd` that has a `.netlify` or `netlify.toml`. This allows Netlify CLI users
// to `cd` into monorepo directories to change their base and build directories.
// Do all checks in parallel for speed
const getBaseOverride = async function({ repositoryRoot, cwd }) {
  // Performance optimization
  if (repositoryRoot === cwd) {
    return {}
  }

  const [repositoryRootA, cwdA] = await Promise.all([pRealpath(repositoryRoot), pRealpath(cwd)])
  const basePaths = getBasePaths(repositoryRootA, cwdA)
  const basePath = await locatePath(basePaths)

  if (basePath === undefined) {
    return {}
  }

  // `base` starting with a `/` are relative to `repositoryRoot`, so we cannot
  // return an absolute path
  const base = relative(repositoryRoot, dirname(basePath))
  // When `base` is explicitely overridden, `baseRelDir: true` makes more sense
  // since we want `publish` and `functions` to be relative to it.
  return { base, baseRelDir: true }
}

// Returns list of files to check for the existence of a `base`
const getBasePaths = function(repositoryRoot, cwd) {
  const subdirs = getSubdirs(repositoryRoot, cwd)
  const basePaths = subdirs.flatMap(subdir => BASE_FILENAMES.map(filename => `${subdir}/${filename}`))
  return basePaths
}

// Retrieves list of directories between `repositoryRoot` and `cwd`, including
// `cwd` but excluding `repositoryRoot`
const getSubdirs = function(repositoryRoot, dir, subdirs = []) {
  if (!dir.startsWith(`${repositoryRoot}${sep}`)) {
    return subdirs
  }

  return getSubdirs(repositoryRoot, dirname(dir), [...subdirs, dir])
}

const BASE_FILENAMES = ['.netlify', 'netlify.toml']

// Returns the first path that exists.
// Like `locate-path` library but works with mixed files/directories
const locatePath = async function(paths) {
  const results = await Promise.all(paths.map(returnIfExists))
  const path = results.find(Boolean)
  return path
}

const returnIfExists = async function(path) {
  if (!(await pathExists(path))) {
    return
  }

  return path
}

module.exports = { getBaseOverride }
