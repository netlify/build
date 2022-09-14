import { git } from './exec.js'

// Returns the number of lines of code added, removed or modified since the
// `base` commit
export const getLinesOfCode = function (base: string, head: string, cwd: string) {
  const stdout = git(['diff', '--shortstat', `${base}...${head}`], cwd)
  const insertions = parseStdout(stdout, INSERTION_REGEXP)
  const deletions = parseStdout(stdout, DELETION_REGEXP)
  return insertions + deletions
}

const parseStdout = function (stdout: string, regexp: RegExp) {
  const result = regexp.exec(stdout)

  if (result === null) {
    return 0
  }

  return Number(result[1])
}

const INSERTION_REGEXP = /(\d+) insertion/
const DELETION_REGEXP = /(\d+) deletion/
