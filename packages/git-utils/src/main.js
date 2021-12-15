import { getCommits } from './commits.js'
import { getDiffFiles } from './diff.js'
import { fileMatch } from './match.js'
import { getBase, getHead } from './refs.js'
import { getLinesOfCode } from './stats.js'

// Main entry point to the git utilities
export const getGitUtils = function ({ base, head, cwd } = {}) {
  const headA = getHead(cwd, head)
  const baseA = getBase(base, headA, cwd)
  const { modifiedFiles, createdFiles, deletedFiles } = getDiffFiles(baseA, headA, cwd)
  const commits = getCommits(baseA, headA, cwd)
  const linesOfCode = getLinesOfCode(baseA, headA, cwd)
  const fileMatchA = fileMatch.bind(null, { modifiedFiles, createdFiles, deletedFiles })
  return { modifiedFiles, createdFiles, deletedFiles, commits, linesOfCode, fileMatch: fileMatchA }
}
