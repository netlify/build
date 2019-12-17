const { getBase } = require('./refs')
const { getDiffFiles } = require('./diff')
const { getCommits } = require('./commits')
const { getLinesOfCode } = require('./stats')
const { getMatchers } = require('./match')

// Main entry point to the git utilities
const getGitUtils = async function({ base } = {}) {
  const baseA = await getBase(base)
  const [{ modifiedFiles, createdFiles, deletedFiles }, commits, linesOfCode] = await Promise.all([
    getDiffFiles(baseA),
    getCommits(baseA),
    getLinesOfCode(baseA),
  ])
  const { fileMatch, match } = getMatchers({ modifiedFiles, createdFiles, deletedFiles })
  return { modifiedFiles, createdFiles, deletedFiles, fileMatch, match, commits, linesOfCode }
}

module.exports = getGitUtils
