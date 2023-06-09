import { handleBuildError } from '../error/handle.js'
import { reportError } from '../error/report.js'
import { getSystemLogger } from '../log/logger.js'
import { logTimer, logBuildSuccess } from '../log/messages/core.js'
import { trackBuildComplete } from '../telemetry/main.js'
import { reportTimers } from '../time/report.js'

import { execBuild, startBuild } from './build.js'
import { reportMetrics } from './report_metrics.js'
import { getSeverity } from './severity.js'
import { BuildFlags } from './types.js'

export { startDev } from './dev.js'
export { runCoreSteps } from '../steps/run_core_steps.js'

/**
 * Main entry point of Netlify Build.
 * Runs a builds and returns whether it succeeded or not.
 *
 * @param flags - build configuration CLI flags
 */
export default async function buildSite(flags: Partial<BuildFlags> = {}): Promise<{
  success: boolean
  severityCode: number
  logs: any
  netlifyConfig?: any
  configMutations?: any
}> {
  const {
    errorMonitor,
    framework,
    mode,
    logs,
    debug,
    systemLogFile,
    testOpts,
    statsdOpts,
    dry,
    telemetry,
    buildId,
    deployId,
    ...flagsA
  }: any = startBuild(flags)
  const errorParams = { errorMonitor, mode, logs, debug, testOpts }
  const systemLog = getSystemLogger(logs, debug, systemLogFile)

  try {
    const {
      pluginsOptions,
      netlifyConfig: netlifyConfigA,
      siteInfo,
      userNodeVersion,
      stepsCount,
      timers,
      durationNs,
      configMutations,
      metrics,
    } = await execBuild({
      ...flagsA,
      buildId,
      systemLogFile,
      deployId,
      dry,
      errorMonitor,
      mode,
      logs,
      debug,
      testOpts,
      errorParams,
      framework,
    })
    await handleBuildSuccess({
      framework,
      dry,
      logs,
      timers,
      durationNs,
      statsdOpts,
      systemLog,
      metrics,
    })
    const { success, severityCode, status } = getSeverity('success')
    await telemetryReport({
      buildId,
      deployId,
      status,
      stepsCount,
      pluginsOptions,
      durationNs,
      siteInfo,
      telemetry,
      userNodeVersion,
      framework,
      testOpts,
      errorParams,
    })
    return { success, severityCode, netlifyConfig: netlifyConfigA, logs, configMutations }
  } catch (error) {
    const { severity } = await handleBuildError(error, errorParams as any)
    const { pluginsOptions, siteInfo, userNodeVersion }: any = errorParams
    const { success, severityCode, status } = getSeverity(severity)
    await telemetryReport({
      buildId,
      deployId,
      status,
      pluginsOptions,
      siteInfo,
      telemetry,
      userNodeVersion,
      framework,
      testOpts,
      errorParams,
    })
    await reportError(error, statsdOpts, framework)

    return { success, severityCode, logs }
  }
}

// Logs and reports that a build successfully ended
const handleBuildSuccess = async function ({
  framework,
  dry,
  logs,
  timers,
  durationNs,
  statsdOpts,
  systemLog,
  metrics,
}) {
  if (dry) {
    return
  }

  logBuildSuccess(logs)

  logTimer(logs, durationNs, 'Netlify Build', systemLog)
  await reportTimers(timers, statsdOpts, framework)
  await reportMetrics(statsdOpts, metrics)
}

// Handles the calls and errors of telemetry reports
const telemetryReport = async function ({
  deployId,
  buildId,
  status,
  stepsCount,
  pluginsOptions,
  durationNs,
  siteInfo,
  telemetry,
  userNodeVersion,
  framework,
  testOpts,
  errorParams,
}: any) {
  try {
    await trackBuildComplete({
      deployId,
      buildId,
      status,
      stepsCount,
      pluginsOptions,
      durationNs,
      siteInfo,
      telemetry,
      userNodeVersion,
      framework,
      testOpts,
    })
  } catch (error) {
    await handleBuildError(error, errorParams)
  }
}
