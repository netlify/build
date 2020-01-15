const {
  env: { CACHED_COMMIT_REF, TEST_HEAD },
} = require('process')

const { git } = require('./exec')

// Retrieve the `base` commit
const getBase = async function(base, cwd) {
  const baseA = getBaseRef(base)
  await verifyBase(baseA, cwd)
  return baseA
}

const getBaseRef = function(base) {
  // istanbul ignore next
  if (base !== undefined) {
    return base
  }

  // istanbul ignore else
  if (CACHED_COMMIT_REF) {
    return CACHED_COMMIT_REF
  }

  // istanbul ignore next
  return DEFAULT_BASE
}

const DEFAULT_BASE = 'master'

const verifyBase = async function(base, cwd) {
  try {
    await git(['rev-parse', base], cwd)
  } catch (error) {
    throw new Error(`Invalid base commit ${base}\n${error.stderr}`)
  }
}

// `TEST_HEAD` is only used in unit tests
// istanbul ignore next
const HEAD = TEST_HEAD === undefined ? 'HEAD' : TEST_HEAD

module.exports = { getBase, HEAD }
