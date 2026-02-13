import { bindOpts as cacheBindOpts } from '@netlify/cache-utils'
import { add as functionsAdd, list as functionsList, listAll as functionsListAll } from '@netlify/functions-utils'
import { getGitUtils } from '@netlify/git-utils'
import { run as baseRun, runCommand } from '@netlify/run-utils'

import { failBuild, failPlugin, cancelBuild, failPluginWithWarning } from '../error.js'
import { isSoftFailEvent } from '../events.js'
import { isReservedEnvironmentVariableKey } from '../../utils/environment.js'
import type { NetlifyPluginConstants } from '../../core/constants.js'
import type { ReturnValue } from '../../steps/return_values.ts'
import type { NetlifyPluginUtils } from '../../types/options/netlify_plugin_utils.js'
import type { NetlifyPluginFunctionsUtil } from '../../types/options/netlify_plugin_functions_util.js'

import { addLazyProp } from './lazy.js'
import { show } from './status.js'

type BuildEvent = 'onPreBuild' | 'onBuild' | 'onPostBuild' | 'onError' | 'onSuccess' | 'onEnd'

type RunState = Record<string, unknown>

type DeployEnvVarsData = { key: string; value: string; isSecret: boolean; scopes: string[] }[]

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
    add(key, value, { isSecret = false, scopes = [] } = {}) {
      // Do some basic client-side validation on the injected variables. The build happens long
      // before we attempt to create these environment variables via the Netlify API. We want to
      // give the user as much immediate feedback as possible, so we perform this validation in the
      // build plugin as to direct the user on which build plugin is causing a problem.
      if (isReservedEnvironmentVariableKey(key)) {
        throw new Error(
          `utils.deploy.env.add() failed: "${key}" is a reserved environment variable in Netlify deployments. Use a different environment variable key.`,
        )
      }

      let normalizedScopes = new Set(...scopes)
      if (normalizedScopes.size === 0) {
        normalizedScopes = new Set(
          // If the user did not specify scopes, we assume they mean all valid scopes. Secrets are
          // not permitted in the post-processing scope.
          isSecret ? ['builds', 'functions', 'runtime'] : ['builds', 'functions', 'post_processing', 'runtime'],
        )
      }
      if (isSecret && normalizedScopes.has('post_processing')) {
        throw new Error(`utils.deploy.env.add() failed: The "post_processing" scope cannot be used with isSecret=true.`)
      }

      const existingDeployEnvVarIdx = deployEnvVars.findIndex((env) => env.key === key)
      if (existingDeployEnvVarIdx !== -1) {
        deployEnvVars[existingDeployEnvVarIdx] = { key, value, isSecret, scopes: Array.from(normalizedScopes) }
      } else {
        deployEnvVars.push({ key, value, isSecret, scopes: Array.from(normalizedScopes) })
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
): NetlifyPluginFunctionsUtil {
  const functionsDirectories = [INTERNAL_FUNCTIONS_SRC, FUNCTIONS_SRC].filter(Boolean)
  const add = (src: string | undefined) => functionsAdd(src, INTERNAL_FUNCTIONS_SRC, { fail: failBuild })
  const list = functionsList.bind(null, functionsDirectories, { fail: failBuild })
  const listAll = functionsListAll.bind(null, functionsDirectories, { fail: failBuild })
  const generate = (functionPath: string) => generatedFunctions.push({ path: functionPath })

  return { add, list, listAll, generate }
}

const getStatusUtils = function (runState) {
  return { show: show.bind(undefined, runState) }
}
