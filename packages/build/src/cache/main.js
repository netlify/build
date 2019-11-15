const { resolve, dirname } = require('path')

const pathExists = require('path-exists')
const del = require('del')
const moveFile = require('move-file')
const cpy = require('cpy')

const { logCacheStart, logCacheDir } = require('../log/main')
const isNetlifyCI = require('../utils/is-netlify-ci')

const cacheArtifacts = async function(baseDir, cacheDir) {
  logCacheStart()

  await saveCache({ baseDir, cacheDir, cacheBase: '.', path: 'node_modules', description: 'Node modules' })
}

const saveCache = async function({ baseDir, cacheDir, cacheBase, path, description }) {
  const cacheBaseA = resolve(baseDir, cacheBase)
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
