'use strict'

const { git } = require('./exec')

// Returns the number of lines of code added, removed or modified since the
// `base` commit
const getLinesOfCode = function (base, head, cwd) {
  const stdout = git(['diff', '--shortstat', `${base}...${head}`], cwd)
  const insertions = parseStdout(stdout, INSERTION_REGEXP)
  const deletions = parseStdout(stdout, DELETION_REGEXP)
  return insertions + deletions
}

const parseStdout = function (stdout, regexp) {
  const result = regexp.exec(stdout)

  if (result === null) {
    return 0
  }

  return Number(result[1])
}

const INSERTION_REGEXP = /(\d+) insertion/
const DELETION_REGEXP = /(\d+) deletion/

module.exports = { getLinesOfCode }
