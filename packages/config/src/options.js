const {
  cwd: getCwd,
  env: { CONTEXT },
} = require('process')
const { dirname } = require('path')

const findUp = require('find-up')

const { removeFalsy } = require('./utils/remove_falsy')

// Normalize options and assign default values
const normalizeOpts = async function(opts = {}) {
  const optsA = removeFalsy(opts)
  const optsB = { ...DEFAULT_OPTS, ...optsA }
  const optsC = await addDefaultRepositoryRoot(optsB)
  const optsD = removeFalsy(optsC)
  return optsD
}

const DEFAULT_OPTS = {
  cwd: getCwd(),
  context: CONTEXT || 'production',
}

// Add a default value for the `repositoryRoot` option.
// Do it by trying to find a `.git` directory up from `cwd`.
// If nothing is found, default to `cwd`.
const addDefaultRepositoryRoot = async function(opts) {
  const repositoryRoot = await getRepositoryRoot(opts)
  return { ...opts, repositoryRoot }
}

const getRepositoryRoot = async function({ repositoryRoot, cwd }) {
  if (repositoryRoot !== undefined) {
    return repositoryRoot
  }

  const repositoryRootA = await findUp('.git', { cwd, type: 'directory' })

  if (repositoryRootA === undefined) {
    return cwd
  }

  return dirname(repositoryRootA)
}

module.exports = { normalizeOpts }
