const {
  env: { CACHED_COMMIT_REF, TEST_HEAD },
} = require('process')

const { git } = require('./exec')

// `TEST_HEAD` is only used in unit tests
// istanbul ignore next
const HEAD = TEST_HEAD === undefined ? 'HEAD' : TEST_HEAD

// Retrieve the `base` commit
const getBase = async function(base, cwd) {
  const refs = getBaseRefs(base)
  const { ref } = await findRef(refs, cwd)
  return ref
}

const getBaseRefs = function(base) {
  // istanbul ignore next
  if (base !== undefined) {
    return [base]
  }

  // istanbul ignore else
  if (CACHED_COMMIT_REF) {
    return [CACHED_COMMIT_REF]
  }

  // istanbul ignore next
  return DEFAULT_BASE
}

// Some git repositories are missing `master` branches, so we also try HEAD^.
// We end with HEAD as a failsafe.
const DEFAULT_BASE = ['master', `${HEAD}^`, HEAD]

// Use the first commit that exists
const findRef = async function(refs, cwd) {
  const results = await Promise.all(refs.map(ref => checkRef(ref, cwd)))
  const result = results.find(refExists)
  if (result === undefined) {
    const message = getErrorMessage(results[0])
    throw new Error(message)
  }
  return result
}

const checkRef = async function(ref, cwd) {
  try {
    await git(['rev-parse', ref], cwd)
    return { ref }
  } catch (error) {
    return { ref, error }
  }
}

const refExists = function({ error }) {
  return error === undefined
}

const getErrorMessage = function({ ref, error: { message, stderr } }) {
  const messages = [message, stderr].filter(Boolean).join('\n')
  return `Invalid base commit ${ref}\n${messages}`
}

module.exports = { HEAD, getBase }
