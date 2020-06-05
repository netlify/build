const cacheUtils = require('@netlify/cache-utils')
const functionsUtils = require('@netlify/functions-utils')
const gitUtils = require('@netlify/git-utils')
const runUtils = require('@netlify/run-utils')

const { failBuild, failPlugin, cancelBuild } = require('../error')

const { getStatusUtil } = require('./status')

// Retrieve the `utils` argument.
const getUtils = function({ constants: { FUNCTIONS_SRC, CACHE_DIR }, runState }) {
  const buildUtils = { failBuild, failPlugin, cancelBuild }
  const gitA = getGitUtils()
  const cache = cacheUtils.bindOpts({ cacheDir: CACHE_DIR })
  const add = src => functionsUtils.add(src, FUNCTIONS_SRC, { fail: failBuild })
  const functions = { add }
  const status = getStatusUtil(runState)
  return {
    build: buildUtils,
    git: gitA,
    cache,
    run: runUtils,
    functions,
    status,
  }
}

const getGitUtils = function() {
  try {
    return gitUtils()
  } catch (error) {
    return {}
  }
}

module.exports = { getUtils }
