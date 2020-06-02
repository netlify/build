const cacheUtils = require('@netlify/cache-utils')
const functionsUtils = require('@netlify/functions-utils')
const gitUtils = require('@netlify/git-utils')
const runUtils = require('@netlify/run-utils')

const { failBuild, failPlugin, cancelBuild } = require('../error')

const { getStatusUtil } = require('./status')

// Some utilities need to perform some async initialization logic first.
// We do it once for all plugins in the parent process then pass it to the child
// processes.
const startUtils = async function(buildDir) {
  const git = await gitUtils({ cwd: buildDir })
  return { git }
}

// Retrieve the `utils` argument.
const getUtils = function({ utilsData: { git }, constants: { FUNCTIONS_SRC, CACHE_DIR }, runState }) {
  const buildUtils = { failBuild, failPlugin, cancelBuild }
  const gitA = gitUtils.load(git)
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

module.exports = { startUtils, getUtils }
