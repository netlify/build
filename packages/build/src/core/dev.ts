import type { Client } from '@bugsnag/js'

import { handleBuildError } from '../error/handle.js'
import type { ConfigMutation } from '../plugins/child/diff.js'
import type { CoreStepFunctionArgs } from '../plugins_core/types.js'
import { getGeneratedFunctions, type ReturnValue } from '../steps/return_values.js'
import type { NetlifyConfig } from '../types/config/netlify_config.js'
import type { NetlifyPluginUtils } from '../types/options/netlify_plugin_utils.js'

import { execBuild, startBuild } from './build.js'
import { getSeverity } from './severity.js'
import type { BuildFlags } from './types.js'

export type DevCommand = (options: CoreStepFunctionArgs & { utils: NetlifyPluginUtils }) => unknown

type DevBuildResult = {
  netlifyConfig: NetlifyConfig
  configMutations: ConfigMutation[]
  returnValues: Record<string, ReturnValue> | undefined
  deployEnvVars: CoreStepFunctionArgs['deployEnvVars']
}

export const startDev = async (devCommand: DevCommand, flags: Partial<BuildFlags> = {}) => {
  const { mode, logs, debug, testOpts, ...normalizedFlags } = startBuild(flags)
  // `startErrorMonitor()` returns `any` because of its untyped `memoizeOne(Bugsnag.start.bind())`
  const errorMonitor = normalizedFlags.errorMonitor as Client | undefined
  const errorParams = { errorMonitor, mode, logs, debug, testOpts }

  try {
    // `execBuild` is wrapped by `measureDuration()`, which loses its return type
    const {
      netlifyConfig: netlifyConfigA,
      configMutations,
      returnValues,
      deployEnvVars,
    } = (await execBuild({
      ...normalizedFlags,
      errorMonitor,
      errorParams,
      mode,
      logs,
      debug,
      testOpts,
      timeline: 'dev',
      devCommand,
    })) as DevBuildResult
    const { success, severityCode } = getSeverity('success')

    return {
      success,
      severityCode,
      netlifyConfig: netlifyConfigA,
      logs,
      configMutations,
      generatedFunctions: getGeneratedFunctions(returnValues),
      deployEnvVars,
    }
  } catch (error) {
    // `handleBuildError()` handles any thrown value, despite its `Error` parameter
    const { severity, message, stack } = await handleBuildError(error as Error, errorParams)
    const { success, severityCode } = getSeverity(severity)

    return { success, severityCode, logs, error: { message, stack }, deployEnvVars: [] }
  }
}
