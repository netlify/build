import { handleBuildError } from '../error/handle.js'
import { logTimer, logBuildSuccess } from '../log/messages/core.js'
import { trackBuildComplete } from '../telemetry/main.js'
import { reportTimers } from '../time/report.js'

import { execBuild, startBuild } from './build.js'
import { getSeverity } from './severity.js'

export const startDev = async (devCommand, flags = {}) => {
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
  } = startBuild(flags)
  const errorParams = { errorMonitor, mode, logs, debug, testOpts }

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
      timeline: 'dev',
      devCommand,
    })
    await handleBuildSuccess({
      framework,
      dry,
      logs,
      timers,
      durationNs,
      statsdOpts,
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
    const { severity, message, stack } = await handleBuildError(error, errorParams)
    const { pluginsOptions, siteInfo, userNodeVersion } = errorParams
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
    return { success, severityCode, logs, error: { message, stack } }
  }
}

// Logs and reports that a build successfully ended
const handleBuildSuccess = async function ({ framework, dry, logs, timers, durationNs, statsdOpts }) {
  if (dry) {
    return
  }

  logBuildSuccess(logs)

  logTimer(logs, durationNs, 'Netlify Build')
  await reportTimers({ timers, statsdOpts, framework })
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
}) {
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
