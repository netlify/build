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

  await Promise.all(ARTIFACTS.map(({ path }) => saveCache({ baseDir, cacheDir, path })))
}

// List of directories to cache
const ARTIFACTS = [
  { path: './node_modules' },
  { path: './bower_components' },
  { path: './.bundle' },
  { path: './.venv' },
  { path: './wapm_packages' },
]

// Cache a single directory
const saveCache = async function({ baseDir, cacheDir, path }) {
  const [base, ...pathA] = path.split('/')
  const baseA = base === '~' ? homedir() : resolve(baseDir, base)
  const relPath = pathA.join('/')
  const srcPath = resolve(baseA, relPath)

  if (!(await pathExists(srcPath))) {
    return
  }

  logCacheDir(path)

  const cachePath = resolve(cacheDir, relPath)
  await del(cachePath, { force: true })

  // In CI, files are directly moved, which is faster.
  // But locally, we want to keep the source files.
  if (isNetlifyCI()) {
    await moveFile(srcPath, cachePath, { overwrite: false })
  } else {
    await cpy(relPath, dirname(cachePath), { cwd: baseA, parents: true })
  }
}

module.exports = { cacheArtifacts }
