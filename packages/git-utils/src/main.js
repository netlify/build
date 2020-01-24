const { cwd: getCwd } = require('process')

const { getBase } = require('./refs')
const { getDiffFiles } = require('./diff')
const { getCommits } = require('./commits')
const { getLinesOfCode } = require('./stats')
const { fileMatch } = require('./match')

// Main entry point to the git utilities
const getGitUtils = async function(
  // istanbul ignore next
  { base, cwd = getCwd() } = {},
) {
  const properties = await addProperties(base, cwd)
  const gitUtils = addMethods(properties)
  return gitUtils
}

const addProperties = async function(base, cwd) {
  const baseA = await getBase(base, cwd)
  const [{ modifiedFiles, createdFiles, deletedFiles }, commits, linesOfCode] = await Promise.all([
    getDiffFiles(baseA, cwd),
    getCommits(baseA, cwd),
    getLinesOfCode(baseA, cwd),
  ])
  return { modifiedFiles, createdFiles, deletedFiles, commits, linesOfCode }
}

const addMethods = function(properties) {
  const fileMatchA = fileMatch.bind(null, properties)
  return { ...properties, fileMatch: fileMatchA }
}

module.exports = getGitUtils
module.exports.load = addMethods
