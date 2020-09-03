const { isSoftFailEvent } = require('../../commands/get')
const { failBuild, failPlugin, cancelBuild, failPluginWithWarning } = require('../error')

const { addLazyProp } = require('./lazy')
const { show } = require('./status')

// Retrieve the `utils` argument.
const getUtils = function({ event, constants: { FUNCTIONS_SRC, CACHE_DIR }, runState }) {
  const build = getBuildUtils(event)
  const utils = { build }
  addLazyProp(utils, 'git', getGitUtils)
  addLazyProp(utils, 'cache', getCacheUtils.bind(null, CACHE_DIR))
  addLazyProp(utils, 'run', getRunUtils)
  addLazyProp(utils, 'functions', getFunctionsUtils.bind(null, FUNCTIONS_SRC))
  addLazyProp(utils, 'status', getStatusUtils.bind(null, runState))
  return utils
}

const getBuildUtils = function(event) {
  if (isSoftFailEvent(event)) {
    return {
      failPlugin,
      failBuild: failPluginWithWarning.bind(null, 'failBuild', event),
      cancelBuild: failPluginWithWarning.bind(null, 'cancelBuild', event),
    }
  }

  return { failBuild, failPlugin, cancelBuild }
}

const getGitUtils = function() {
  return require('@netlify/git-utils')()
}

const getCacheUtils = function(CACHE_DIR) {
  const cacheUtils = require('@netlify/cache-utils')
  return cacheUtils.bindOpts({ cacheDir: CACHE_DIR })
}

const getRunUtils = function() {
  return require('@netlify/run-utils')
}

const getFunctionsUtils = function(FUNCTIONS_SRC) {
  const functionsUtils = require('@netlify/functions-utils')
  const add = src => functionsUtils.add(src, FUNCTIONS_SRC, { fail: failBuild })
  const list = functionsUtils.list.bind(null, FUNCTIONS_SRC, { fail: failBuild })
  const listAll = functionsUtils.listAll.bind(null, FUNCTIONS_SRC, { fail: failBuild })
  return { add, list, listAll }
}

const getStatusUtils = function(runState) {
  return { show: show.bind(undefined, runState) }
}

module.exports = { getUtils }
