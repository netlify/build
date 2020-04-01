const { stat } = require('fs')
const { basename, dirname } = require('path')
const { promisify } = require('util')

const cpy = require('cpy')
const moveFile = require('move-file')

const pStat = promisify(stat)

// Move or copy a cached file/directory from/to a local one
const moveCacheFile = async function(src, dest, move) {
  // Moving is faster but removes the source files locally
  if (move) {
    return moveFile(src, dest, { overwrite: false })
  }

  const srcGlob = await getSrcGlob(src)
  return cpy(srcGlob, dirname(dest), { cwd: dirname(src), parents: true, overwrite: false })
}

const getSrcGlob = async function(src) {
  const srcBasename = basename(src)
  const stat = await pStat(src)

  if (stat.isDirectory()) {
    return `${srcBasename}/**`
  }

  return srcBasename
}

module.exports = { moveCacheFile }
