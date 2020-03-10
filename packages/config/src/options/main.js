const {
  cwd: getCwd,
  env: { CONTEXT },
} = require('process')

const { removeFalsy } = require('../utils/remove_falsy')

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
  return optsE
}

const DEFAULT_OPTS = {
  cwd: getCwd(),
  context: CONTEXT || 'production',
  baseRelDir: true,
}

module.exports = { normalizeOpts }
