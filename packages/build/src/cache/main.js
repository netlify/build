const { resolve, dirname } = require('path')
const { homedir } = require('os')

const pathExists = require('path-exists')
const del = require('del')
const moveFile = require('move-file')
const cpy = require('cpy')

const { logCacheStart, logCacheDir } = require('../log/main')
const isNetlifyCI = require('../utils/is-netlify-ci')

// Cache a list of pre-defined directories, for future builds to re-use
const cacheArtifacts = async function(baseDir, cacheDir) {
  logCacheStart()

  await Promise.all(
    ARTIFACTS.map(({ base, path, description }) => saveCache({ baseDir, cacheDir, base, path, description })),
  )
}

// List of directories to cache
const ARTIFACTS = [
  { base: '.', path: 'node_modules', description: 'Node modules' },
  { base: '.', path: 'bower_components', description: 'Bower components' },
  { base: '.', path: '.bundle', description: 'Ruby gems' },
  { base: '.', path: '.venv', description: 'Python virtualenv' },
  { base: '.', path: 'wapm_packages', description: 'WAPM packages' },
]

// Cache a single directory
const saveCache = async function({ baseDir, cacheDir, base, path, description }) {
  const cacheBaseA = base === '~' ? homedir() : resolve(baseDir, base)
  const srcPath = resolve(cacheBaseA, path)

  if (!(await pathExists(srcPath))) {
    return
  }

  logCacheDir(description)

  const cachePath = resolve(cacheDir, path)
  await del(cachePath, { force: true })

  // In CI, files are directly moved, which is faster.
  // But locally, we want to keep the source files.
  if (isNetlifyCI()) {
    await moveFile(srcPath, cachePath, { overwrite: false })
  } else {
    await cpy(path, dirname(cachePath), { cwd: cacheBaseA, parents: true })
  }
}

module.exports = { cacheArtifacts }
