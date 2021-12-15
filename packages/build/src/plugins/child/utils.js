'use strict'

const { bindOpts: cacheBindOpts } = require('@netlify/cache-utils')
const { add: functionsAdd, list: functionsList, listAll: functionsListAll } = require('@netlify/functions-utils')
const getGitUtils = require('@netlify/git-utils')
const run = require('@netlify/run-utils')

const { failBuild, failPlugin, cancelBuild, failPluginWithWarning } = require('../error')
const { isSoftFailEvent } = require('../events')

const { addLazyProp } = require('./lazy')
const { show } = require('./status')

// Retrieve the `utils` argument.
const getUtils = function ({ event, constants: { FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC, CACHE_DIR }, runState }) {
  const build = getBuildUtils(event)
  const cache = getCacheUtils(CACHE_DIR)
  const functions = getFunctionsUtils(FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC)
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

const getCacheUtils = function (CACHE_DIR) {
  return cacheBindOpts({ cacheDir: CACHE_DIR })
}

const getFunctionsUtils = function (FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC) {
  const functionsDirectories = [INTERNAL_FUNCTIONS_SRC, FUNCTIONS_SRC].filter(Boolean)
  const add = (src) => functionsAdd(src, INTERNAL_FUNCTIONS_SRC, { fail: failBuild })
  const list = functionsList.bind(null, functionsDirectories, { fail: failBuild })
  const listAll = functionsListAll.bind(null, functionsDirectories, { fail: failBuild })
  return { add, list, listAll }
}

const getStatusUtils = function (runState) {
  return { show: show.bind(undefined, runState) }
}

module.exports = { getUtils }
