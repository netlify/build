import { getConfigOpts, loadConfig } from '../core/config.js'
import { getConstants } from '../core/constants.js'
import { normalizeFlags } from '../core/normalize_flags.js'
import { getSeverity } from '../core/severity.js'
import { handleBuildError } from '../error/handle.js'
import { getErrorInfo } from '../error/info.js'
import { startErrorMonitor } from '../error/monitor/start.js'
import { getBufferLogs } from '../log/logger.js'
import { logBuildStart } from '../log/messages/core.js'
import { reportStatuses } from '../status/report.js'

import { getSteps } from './get.js'
import { runSteps } from './run_steps.js'

/**
 * Runs specific core steps for a build and returns whether it succeeded or not.
 *
 * @param  {string[]} [buildSteps] - a string array of build steps to run
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
export const runCoreSteps = async (buildSteps, flags = {}) => {
  const { errorMonitor, mode, logs, debug, ...flagsA } = startBuild(flags)
  const errorParams = { errorMonitor, mode, logs, debug }

  try {
    const { netlifyConfig: netlifyConfigA, configMutations } = await executeBuildStep({
      ...flagsA,
      errorMonitor,
      mode,
      logs,
      debug,
      errorParams,
      buildSteps,
    })
    const { success, severityCode } = getSeverity('success')

    return { success, severityCode, netlifyConfig: netlifyConfigA, configMutations, logs }
  } catch (error) {
    const { severity } = await handleBuildError(error, errorParams)
    const { success, severityCode } = getSeverity(severity)

    return { success, severityCode, logs }
  }
}

const startBuild = function (flags) {
  const logs = getBufferLogs(flags)

  logBuildStart(logs)

  const { bugsnagKey, ...flagsA } = normalizeFlags(flags, logs)
  const errorMonitor = startErrorMonitor({ flags: flagsA, logs, bugsnagKey })

  return { ...flagsA, errorMonitor, logs }
}

const getBuildSteps = function (buildSteps) {
  const allSteps = getSteps([]).steps.filter(({ coreStepId }) => buildSteps.includes(coreStepId))

  return allSteps
}

const executeBuildStep = async function ({
  config,
  defaultConfig,
  cachedConfig,
  debug,
  nodePath,
  functionsDistDir,
  edgeFunctionsDistDir,
  errorMonitor,
  mode,
  logs,
  errorParams,
  featureFlags,
  buildSteps,
  repositoryRoot,
}) {
  const configOpts = getConfigOpts({
    config,
    defaultConfig,
    featureFlags,
    mode,
    repositoryRoot,
  })
  const {
    netlifyConfig,
    buildDir,
    siteInfo,
    childEnv,
    userNodeVersion,
    repositoryRoot: repositoryRootA,
  } = await loadConfig({
    configOpts,
    cachedConfig,
    debug,
    logs,
    nodePath,
    timers: [],
  })
  const constants = await getConstants({
    buildDir,
    functionsDistDir,
    edgeFunctionsDistDir,
    netlifyConfig,
    siteInfo,
    mode,
  })

  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(errorParams, { netlifyConfig, siteInfo, childEnv, userNodeVersion })

  try {
    const { netlifyConfig: netlifyConfigA, configMutations } = await runBuildStep({
      netlifyConfig,
      buildDir,
      nodePath,
      logs,
      debug,
      constants,
      featureFlags,
      childEnv,
      buildSteps,
      repositoryRoot: repositoryRootA,
    })

    return {
      netlifyConfig: netlifyConfigA,
      configMutations,
    }
  } catch (error) {
    const [{ statuses }] = getErrorInfo(error)

    await reportStatuses({
      statuses,
      childEnv,
      mode,
      netlifyConfig,
      errorMonitor,
      logs,
      debug,
      pluginsOptions: [],
    })

    throw error
  }
}

const runBuildStep = async function ({
  netlifyConfig,
  buildDir,
  nodePath,
  constants,
  logs,
  debug,
  featureFlags,
  childEnv,
  buildSteps,
  repositoryRoot,
}) {
  const { netlifyConfig: netlifyConfigA, configMutations } = await runSteps({
    steps: getBuildSteps(buildSteps),
    buildDir,
    nodePath,
    constants,
    netlifyConfig,
    logs,
    debug,
    timers: [],
    featureFlags,
    childEnv,
    repositoryRoot,
  })

  return { netlifyConfig: netlifyConfigA, configMutations }
}
