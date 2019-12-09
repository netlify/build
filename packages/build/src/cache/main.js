const { resolve, dirname, basename } = require('path')
const { homedir } = require('os')
const {
  env: { CACHE_BASE },
} = require('process')

const pathExists = require('path-exists')
const del = require('del')
const moveFile = require('move-file')
const cpy = require('cpy')

const { logCacheStart, logCacheDir } = require('../log/main')
const isNetlifyCI = require('../utils/is-netlify-ci')

const { getCacheDir } = require('./dir')

// Cache a list of pre-defined directories, for future builds to re-use
const cacheArtifacts = async function(baseDir) {
  logCacheStart()

  const cacheDir = getCacheDir()
  await Promise.all(ARTIFACTS.map(({ base, path }) => saveCache({ baseDir, cacheDir, base, path })))
}

// List of directories to cache
const ARTIFACTS = [
  // Node modules
  { path: 'node_modules' },
  // Bower components
  { path: 'bower_components' },
  // Ruby gems
  { path: '.bundle' },
  // Python virtualenv
  { path: '.venv' },
  // WAPM packages (WebAssembly)
  { path: 'wapm_packages' },
  // Yarn
  { base: '~', path: '.yarn_cache' },
  // Pip
  { base: '~', path: '.cache/pip' },
  // Emacs cask
  { base: '~', path: '.cask' },
  // Emacs
  { base: '~', path: '.emacs.d' },
  // Maven
  { base: '~', path: '.m2' },
  // Boot
  { base: '~', path: '.boot' },
  // Composer
  { base: '~', path: '.composer' },
  // Wasmer
  { base: '~', path: '.wasmer/cache' },
  // Go dependencies
  { base: '~', path: '.gimme_cache' },
  // TODO: the buildbot currently uses different file paths. Once Netlify Build
  // handles both saving cache and restoring cache, this should not be an issue
  // anymore.
  //   CACHE_DIR/node_version -> CACHE_DIR/.nvm/versions/node[/$NODE_VERSION]
  //   CACHE_DIR/ruby_version -> CACHE_DIR/.rvm/rubies[/ruby-$RUBY_VERSION]
  // nvm
  { base: '~', path: '.nvm/versions/node' },
  // TODO: only cache rvm when the version is not already in the Docker image,
  // i.e. it is a custom version
  // rvm
  { base: '~', path: '.rvm/rubies' },
]

// Cache a single directory
const saveCache = async function({ baseDir, cacheDir, base, path }) {
  const { srcPath, cachePath } = parseCachePath({ baseDir, cacheDir, base, path })

  if (!(await pathExists(srcPath))) {
    return
  }

  logCacheDir(path)

  await persistCache(srcPath, cachePath)
}

const parseCachePath = function({ baseDir, cacheDir, base, path }) {
  const baseA = getBase(base, baseDir)
  const srcPath = resolve(baseA, path)
  const cachePath = resolve(cacheDir, path)
  return { srcPath, cachePath }
}

const getBase = function(base, baseDir) {
  // This is used in tests
  if (CACHE_BASE !== undefined) {
    return resolve(baseDir, CACHE_BASE)
  }

  // istanbul ignore next
  if (base === '~') {
    return homedir()
  }

  // istanbul ignore next
  return resolve(baseDir, base)
}

// In CI, files are directly moved, which is faster.
// But locally, we want to keep the source files.
const persistCache = async function(srcPath, cachePath) {
  await del(cachePath, { force: true })

  if (!isNetlifyCI()) {
    return cpy(basename(srcPath), dirname(cachePath), {
      cwd: dirname(srcPath),
      parents: true,
      overwrite: false,
    })
  }

  await moveFile(srcPath, cachePath, { overwrite: false })
}

module.exports = { cacheArtifacts }
