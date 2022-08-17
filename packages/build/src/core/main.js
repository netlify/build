import { handleBuildError } from '../error/handle.js'
import { logTimer, logBuildSuccess } from '../log/messages/core.js'
import { trackBuildComplete } from '../telemetry/main.js'
import { reportTimers } from '../time/report.js'

import { execBuild, startBuild } from './build.js'
import { getSeverity } from './severity.js'

export { startDev } from './dev.js'
export { runCoreSteps } from '../steps/run_core_steps.js'

/**
 * Main entry point of Netlify Build.
 * Runs a builds and returns whether it succeeded or not.
 *
 * @param  {object} [flags] - build configuration CLI flags
 * @param  {string} [flags.config] - Path to the configuration file
 * @param  {string} [flags.cwd] - Current directory. Used to retrieve the configuration file
 * @param  {string} [flags.repositoryRoot] - Git repository root directory. Used to retrieve the configuration file.
 * @param  {string} [flags.apiHost] - Netlify API endpoint
 * @param  {string} [flags.token] - Netlify API token for authentication
 * @param  {string} [flags.siteId] - Netlify Site ID
 * @param  {string} [flags.deployId] - Netlify Deploy ID
 * @param  {string} [flags.context] - Build context
 * @param  {string} [flags.branch] - Repository branch
 * @param  {boolean} [flags.dry=false] - Run in dry mode, i.e. printing steps without executing them
 * @param  {string} [flags.nodePath] - Path to the Node.js binary to use in the build command and plugins
 * @param  {boolean} [flags.buffer=false] - Buffer output instead of printing it
 *
 * @returns {object} buildResult
 * @returns {boolean} buildResult.success - Whether build succeeded or failed
 * @returns {number} buildResult.severityCode - Build success/failure status among:
 * 0 (success), 1 (build cancelled), 2 (user error), 3 (plugin error), 4 (system error). Can be used as exit code.
 * @returns {string[]} buildResult.logs - When using the `buffer` option, all log messages
 */
export default async function buildSite(flags = {}) {
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
    const { severity } = await handleBuildError(error, errorParams)
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
    return { success, severityCode, logs }
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
