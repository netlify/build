'use strict'

const { getCommits } = require('./commits')
const { getDiffFiles } = require('./diff')
const { fileMatch } = require('./match')
const { getBase, getHead } = require('./refs')
const { getLinesOfCode } = require('./stats')

// Main entry point to the git utilities
const getGitUtils = function ({ base, head, cwd } = {}) {
  const headA = getHead(cwd, head)
  const baseA = getBase(base, headA, cwd)
  const { modifiedFiles, createdFiles, deletedFiles } = getDiffFiles(baseA, headA, cwd)
  const commits = getCommits(baseA, headA, cwd)
  const linesOfCode = getLinesOfCode(baseA, headA, cwd)
  const fileMatchA = fileMatch.bind(null, { modifiedFiles, createdFiles, deletedFiles })
  return { modifiedFiles, createdFiles, deletedFiles, commits, linesOfCode, fileMatch: fileMatchA }
}

module.exports = getGitUtils
