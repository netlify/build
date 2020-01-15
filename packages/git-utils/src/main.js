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
  const baseA = await getBase(base)
  const [{ modifiedFiles, createdFiles, deletedFiles }, commits, linesOfCode] = await Promise.all([
    getDiffFiles(baseA),
    getCommits(baseA),
    getLinesOfCode(baseA),
  ])
  return loadGitUtils({ modifiedFiles, createdFiles, deletedFiles, commits, linesOfCode })
}

const loadGitUtils = function(git) {
  const { fileMatch, match } = getMatchers(git)
  return { ...git, fileMatch, match }
}

module.exports = getGitUtils
module.exports.load = loadGitUtils
