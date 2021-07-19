'use strict'

const { failBuild, failPlugin, cancelBuild, failPluginWithWarning } = require('../error')
const { isSoftFailEvent } = require('../events')

const { addLazyProp } = require('./lazy')
const { show } = require('./status')

// Retrieve the `utils` argument.
const getUtils = function ({ event, constants: { FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC, CACHE_DIR }, runState }) {
  const build = getBuildUtils(event)
  const utils = { build }
  addLazyProp(utils, 'git', getGitUtils)
  addLazyProp(utils, 'cache', getCacheUtils.bind(null, CACHE_DIR))
  addLazyProp(utils, 'run', getRunUtils)
  addLazyProp(utils, 'functions', getFunctionsUtils.bind(null, FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC))
  addLazyProp(utils, 'status', getStatusUtils.bind(null, runState))
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

const getGitUtils = function () {
  // eslint-disable-next-line node/global-require
  return require('@netlify/git-utils')()
}

const getCacheUtils = function (CACHE_DIR) {
  // eslint-disable-next-line node/global-require
  const cacheUtils = require('@netlify/cache-utils')
  return cacheUtils.bindOpts({ cacheDir: CACHE_DIR })
}

const getRunUtils = function () {
  // eslint-disable-next-line node/global-require
  return require('@netlify/run-utils')
}

const getFunctionsUtils = function (FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC) {
  const functionsDirectories = [INTERNAL_FUNCTIONS_SRC, FUNCTIONS_SRC].filter(Boolean)
  // eslint-disable-next-line node/global-require
  const functionsUtils = require('@netlify/functions-utils')
  const add = (src) => functionsUtils.add(src, INTERNAL_FUNCTIONS_SRC, { fail: failBuild })
  const list = functionsUtils.list.bind(null, functionsDirectories, { fail: failBuild })
  const listAll = functionsUtils.listAll.bind(null, functionsDirectories, { fail: failBuild })
  return { add, list, listAll }
}

const getStatusUtils = function (runState) {
  return { show: show.bind(undefined, runState) }
}

module.exports = { getUtils }
