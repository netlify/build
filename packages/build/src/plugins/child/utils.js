'use strict'

const { failBuild, failPlugin, cancelBuild, failPluginWithWarning } = require('../error')
const { isSoftFailEvent } = require('../events')

const { addLazyProp } = require('./lazy')
const { show } = require('./status')

const cacheUtilsPromise = import('@netlify/cache-utils')
const functionsUtilsPromise = import('@netlify/functions-utils')
const gitUtilsPromise = import('@netlify/git-utils')
const runUtilsPromise = import('@netlify/run-utils')

// Retrieve the `utils` argument.
const getUtils = async function ({ event, constants: { FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC, CACHE_DIR }, runState }) {
  const [cacheUtils, functionsUtils, { getGitUtils }, { run, runCommand }] = await Promise.all([
    cacheUtilsPromise,
    functionsUtilsPromise,
    gitUtilsPromise,
    runUtilsPromise,
  ])
  // eslint-disable-next-line fp/no-mutation
  run.command = runCommand

  const build = getBuildUtils(event)
  const cache = getCacheUtils(cacheUtils, CACHE_DIR)
  const functions = getFunctionsUtils(functionsUtils, FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC)
  const status = getStatusUtils(runState)
  const utils = { build, cache, run, functions, status }
  addLazyProp(utils, 'git', () => getGitUtils())
  return utils
}

const getBuildUtils = function (event) {
  if (isSoftFailEvent(event)) {
    return {
      failPlugin,
      failBuild: failPluginWithWarning.bind(null, 'failBuild', event),
      cancelBuild: failPluginWithWarning.bind(null, 'cancelBuild', event),
    }
  }

  return { failBuild, failPlugin, cancelBuild }
}

const getCacheUtils = function (cacheUtils, CACHE_DIR) {
  return cacheUtils.bindOpts({ cacheDir: CACHE_DIR })
}

const getFunctionsUtils = function (functionsUtils, FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC) {
  const functionsDirectories = [INTERNAL_FUNCTIONS_SRC, FUNCTIONS_SRC].filter(Boolean)
  const add = (src) => functionsUtils.add(src, INTERNAL_FUNCTIONS_SRC, { fail: failBuild })
  const list = functionsUtils.list.bind(null, functionsDirectories, { fail: failBuild })
  const listAll = functionsUtils.listAll.bind(null, functionsDirectories, { fail: failBuild })
  return { add, list, listAll }
}

const getStatusUtils = function (runState) {
  return { show: show.bind(undefined, runState) }
}

module.exports = { getUtils }
