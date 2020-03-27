const {
  cwd: getCwd,
  env: { CONTEXT },
} = require('process')

const { throwError } = require('../error')
const { removeFalsy } = require('../utils/remove_falsy')
const { dirExists } = require('../utils/dir-exists')

const { getRepositoryRoot } = require('./repository_root')
const { getBranch } = require('./branch')

// Normalize options and assign default values
const normalizeOpts = async function(opts) {
  const optsA = removeFalsy(opts)
  const optsB = { ...DEFAULT_OPTS, ...optsA }

  const repositoryRoot = await getRepositoryRoot(optsB)
  const optsC = { ...optsB, repositoryRoot }

  const branch = await getBranch(optsC)
  const optsD = { ...optsC, branch }

  const optsE = removeFalsy(optsD)
  await checkDirs(optsE)
  return optsE
}

const DEFAULT_OPTS = {
  cwd: getCwd(),
  context: CONTEXT || 'production',
  baseRelDir: true,
}

// Verify that options point to existing directories
const checkDirs = async function(opts) {
  await Promise.all(DIR_OPTIONS.map(optName => checkDir(opts, optName)))
}

const DIR_OPTIONS = ['cwd', 'repositoryRoot']

const checkDir = async function(opts, optName) {
  const path = opts[optName]
  if (!(await dirExists(path))) {
    throwError(`Option '${optName}' points to a non-existing directory: ${path}`)
  }
}

module.exports = { normalizeOpts }
