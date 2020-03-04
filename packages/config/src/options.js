const {
  cwd: getCwd,
  env: { CONTEXT },
} = require('process')

const { addDefaultRepositoryRoot } = require('./repository_root')
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

module.exports = { normalizeOpts }
