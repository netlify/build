const { getBase } = require('./refs')
const { getDiffFiles } = require('./diff')
const { getCommits } = require('./commits')
const { getLinesOfCode } = require('./stats')
const { getMatchers } = require('./match')

// Main entry point to the git utilities
const getGitUtils = async function(
  // istanbul ignore next
  { base } = {},
) {
  const properties = await addProperties(base)
  const gitUtils = addMethods(properties)
  return gitUtils
}

const addProperties = async function(base) {
  const baseA = await getBase(base)
  const [{ modifiedFiles, createdFiles, deletedFiles }, commits, linesOfCode] = await Promise.all([
    getDiffFiles(baseA),
    getCommits(baseA),
    getLinesOfCode(baseA),
  ])
  return { modifiedFiles, createdFiles, deletedFiles, commits, linesOfCode }
}

const addMethods = function(properties) {
  const { fileMatch, match } = getMatchers(properties)
  return { ...properties, fileMatch, match }
}

module.exports = getGitUtils
module.exports.load = addMethods
