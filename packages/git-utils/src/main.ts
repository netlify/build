import { getCommits } from './commits.js'
import { getDiffFiles } from './diff.js'
import { fileMatch } from './match.js'
import { getBase, getHead } from './refs.js'
import { getLinesOfCode } from './stats.js'

type getGitUtilsParams = {
  base?: string
  head?: string
  cwd?: string
}

// Main entry point to the git utilities
export function getGitUtils({ base, head, cwd }: getGitUtilsParams = {}) {
  const headA = getHead(cwd, head)
  const baseA = getBase(base, headA, cwd)
  const { modifiedFiles, createdFiles, deletedFiles } = getDiffFiles(baseA, headA, cwd)
  const commits = getCommits(baseA, headA, cwd)
  const linesOfCode = getLinesOfCode(baseA, headA, cwd)
  const fileMatchA = fileMatch.bind(null, { modifiedFiles, createdFiles, deletedFiles })
  return { modifiedFiles, createdFiles, deletedFiles, commits, linesOfCode, fileMatch: fileMatchA }
}
