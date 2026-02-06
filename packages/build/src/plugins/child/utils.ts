import { bindOpts as cacheBindOpts } from '@netlify/cache-utils'
import { add as functionsAdd, list as functionsList, listAll as functionsListAll } from '@netlify/functions-utils'
import { getGitUtils } from '@netlify/git-utils'
import { run as baseRun, runCommand } from '@netlify/run-utils'

import { failBuild, failPlugin, cancelBuild, failPluginWithWarning } from '../error.js'
import { isSoftFailEvent } from '../events.js'
import { isReservedEnvironmentVariableKey } from '../../utils/deploy_metadata.js'
import type { NetlifyPluginConstants } from '../../core/constants.js'
import type { ReturnValue } from '../../steps/return_values.ts'
import type { NetlifyPluginUtils } from '../../types/options/netlify_plugin_utils.js'

import { addLazyProp } from './lazy.js'
import { show } from './status.js'

type BuildEvent = 'onPreBuild' | 'onBuild' | 'onPostBuild' | 'onError' | 'onSuccess' | 'onEnd'

type RunState = Record<string, unknown>

type DeployEnvVarsData = { key: string; value: string; isSecret: boolean }[]

// Retrieve the `utils` argument.
export const getUtils = function ({
  event,
  constants: { FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC, CACHE_DIR },
  generatedFunctions = [],
  runState,
  deployEnvVars = [],
}: {
  event: BuildEvent
  constants: NetlifyPluginConstants
  generatedFunctions?: ReturnValue['generatedFunctions']
  runState: RunState
  deployEnvVars: DeployEnvVarsData
}): NetlifyPluginUtils {
  const run = Object.assign(baseRun, { command: runCommand }) as unknown as NetlifyPluginUtils['run']
  const build = getBuildUtils(event)
  const cache = getCacheUtils(CACHE_DIR)
  const deploy = getDeployUtils({ deployEnvVars })
  const functions = getFunctionsUtils(FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC, generatedFunctions)
  const status = getStatusUtils(runState)
  const utils = { build, cache, deploy, functions, run, status }
  addLazyProp(utils, 'git', () => getGitUtils())
  return utils as typeof utils & { git: NetlifyPluginUtils['git'] }
}

const getDeployUtils = ({ deployEnvVars }: { deployEnvVars: DeployEnvVarsData }): NetlifyPluginUtils['deploy'] => {
  const env: NetlifyPluginUtils['deploy']['env'] = {
    add(key, value, { isSecret = false } = {}) {
      if (isReservedEnvironmentVariableKey(key)) {
        throw new Error(
          `utils.deploy.env.add() failed: "${key}" is a reserved environment variable in Netlify deployments. Use a different environment variable key.`,
        )
      }

      const existingDeployEnvVarIdx = deployEnvVars.findIndex((env) => env.key === key)
      if (existingDeployEnvVarIdx !== -1) {
        deployEnvVars[existingDeployEnvVarIdx] = { key, value, isSecret }
      } else {
        deployEnvVars.push({ key, value, isSecret })
      }

      return env
    },
  }
  return Object.freeze({ env: Object.freeze(env) })
}

const getBuildUtils = function (event: 'onPreBuild' | 'onBuild' | 'onPostBuild' | 'onError' | 'onSuccess' | 'onEnd') {
  if (isSoftFailEvent(event)) {
    return {
      failPlugin,
      failBuild: failPluginWithWarning.bind(null, 'failBuild', event),
      cancelBuild: failPluginWithWarning.bind(null, 'cancelBuild', event),
    }
  }

  return { failBuild, failPlugin, cancelBuild }
}

const getCacheUtils = function (CACHE_DIR: string) {
  return cacheBindOpts({ cacheDir: CACHE_DIR })
}

const getFunctionsUtils = function (
  FUNCTIONS_SRC: string | undefined,
  INTERNAL_FUNCTIONS_SRC: string | undefined,
  generatedFunctions: { path: string }[],
) {
  const functionsDirectories = [INTERNAL_FUNCTIONS_SRC, FUNCTIONS_SRC].filter(Boolean)
  const add = (src: string | undefined) => functionsAdd(src, INTERNAL_FUNCTIONS_SRC, { fail: failBuild })
  const list = functionsList.bind(null, functionsDirectories, { fail: failBuild })
  const listAll = functionsListAll.bind(null, functionsDirectories, { fail: failBuild })
  const generate = (functionPath: string) => generatedFunctions.push({ path: functionPath })

  /** @type import('../../types/options/netlify_plugin_functions_util.js').NetlifyPluginFunctionsUtil */
  return { add, list, listAll, generate }
}

const getStatusUtils = function (runState) {
  return { show: show.bind(undefined, runState) }
}
