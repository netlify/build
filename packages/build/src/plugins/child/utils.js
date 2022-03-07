import { bindOpts as cacheBindOpts } from '@netlify/cache-utils'
import { add as functionsAdd, list as functionsList, listAll as functionsListAll } from '@netlify/functions-utils'
import { getGitUtils } from '@netlify/git-utils'
import { run, runCommand } from '@netlify/run-utils'

import { failBuild, failPlugin, cancelBuild, failPluginWithWarning } from '../error.js'
import { isSoftFailEvent } from '../events.js'

import { addLazyProp } from './lazy.js'
import { show } from './status.js'

// Retrieve the `utils` argument.
export const getUtils = function ({
  event,
  constants: { FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC, CACHE_DIR },
  runState,
}) {
  // eslint-disable-next-line fp/no-mutation
  run.command = runCommand

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
