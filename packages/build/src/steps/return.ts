import type { Client } from '@bugsnag/js'
import type { NetlifyAPI } from '@netlify/api'

import type { Metric } from '../core/report_metrics.js'
import type { Mode, TestOptions } from '../core/types.js'
import type { EnvChanges } from '../env/changes.js'
import type { Logs } from '../log/logger.js'
import { logTimer } from '../log/messages/core.js'
import type { OutputFlusher } from '../log/output_flusher.js'
import type { ConfigMutation } from '../plugins/child/diff.js'
import type { CoreStepFunction, CoreStepFunctionArgs, SystemLogger } from '../plugins_core/types.js'
import type { Status } from '../status/add.js'
import type { createTimer } from '../time/main.js'
import type { NetlifyConfig } from '../types/config/netlify_config.js'

import { handleStepError } from './error.js'
import type { ReturnValue } from './return_values.js'

// Retrieve the return value of a step
export const getStepReturn = function ({
  deployEnvVars,
  event,
  packageName,
  newError,
  newEnvChanges,
  newStatus,
  coreStep,
  coreStepName: timerName = `${String(packageName)} ${event}`,
  childEnv,
  mode,
  api,
  errorMonitor,
  deployId,
  netlifyConfig,
  configMutations,
  headersPath,
  redirectsPath,
  logs,
  outputFlusher,
  debug,
  timers,
  durationNs,
  testOpts,
  systemLog,
  quiet,
  metrics,
  returnValue,
}: {
  deployEnvVars: CoreStepFunctionArgs['deployEnvVars'] | undefined
  event: string
  packageName: string | undefined
  newError: unknown
  newEnvChanges: EnvChanges | undefined
  newStatus: Status | undefined
  coreStep: CoreStepFunction | undefined
  coreStepName: string | undefined
  childEnv: NodeJS.ProcessEnv
  mode: Mode
  api: NetlifyAPI | undefined
  errorMonitor: Client | undefined
  deployId: string | undefined
  netlifyConfig: NetlifyConfig
  configMutations: ConfigMutation[]
  headersPath: string | undefined
  redirectsPath: string | undefined
  logs: Logs | undefined
  outputFlusher: OutputFlusher
  debug: boolean
  timers: ReturnType<typeof createTimer>[]
  durationNs: number
  testOpts: TestOptions
  systemLog: SystemLogger
  quiet: boolean | undefined
  metrics: Metric[] | undefined
  returnValue: ReturnValue | undefined
}) {
  if (newError !== undefined) {
    return handleStepError({
      event,
      newError,
      childEnv,
      mode,
      api,
      errorMonitor,
      deployId,
      coreStep,
      netlifyConfig,
      logs,
      debug,
      testOpts,
    })
  }

  if (!quiet) {
    logTimer(logs, durationNs, timerName, systemLog, outputFlusher)
  }

  return {
    deployEnvVars,
    newEnvChanges,
    netlifyConfig,
    configMutations,
    headersPath,
    redirectsPath,
    newStatus,
    timers,
    metrics,
    returnValue,
  }
}
