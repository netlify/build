const pathExists = require('path-exists')

const { readFile } = require('../../utils/fs')

const shasum = require('./shasum')

/**
 * If shas don't match update deps
 * @param  {string} currentPath  - file to check
 * @param  {string} previousPath - location of previous hash
 * @return {Boolean}
 */
module.exports = async function shouldInstallDeps(currentPath, postFix, previousPath) {
  if (!(await pathExists(previousPath))) {
    return true
  }
  const currentSha = await shasum(currentPath)
  // Example xyz123131312313-v8.2.4
  const current = `${currentSha}-${postFix}`
  const previous = await readFile(previousPath)
  if (current !== previous) {
    return true
  }
  return false
}
