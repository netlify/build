import { startBuild } from '../core/build.js'
import { getConfigOpts, loadConfig } from '../core/config.js'
import { getConstants } from '../core/constants.js'
import { getSeverity } from '../core/severity.js'
import type { BuildFlags, BuildResult } from '../core/types.js'
import { handleBuildError } from '../error/handle.js'
import { getErrorInfo } from '../error/info.js'
import { getSystemLogger } from '../log/logger.js'
import { reportStatuses } from '../status/report.js'

import { getSteps } from './get.js'
import { runSteps } from './run_steps.js'

/**
 * Runs specific core steps for a build and returns whether it succeeded or not.
 */
export const runCoreSteps = async (buildSteps: string[], flags: Partial<BuildFlags> = {}): Promise<BuildResult> => {
  const { errorMonitor, mode, logs, debug, ...flagsA }: any = startBuild(flags)
  const errorParams = { errorMonitor, mode, logs, debug }
  const systemLog = getSystemLogger(logs, debug)

  try {
    const { netlifyConfig: netlifyConfigA, configMutations } = await executeBuildStep({
      ...flagsA,
      errorMonitor,
      mode,
      logs,
      debug,
      errorParams,
      buildSteps,
      systemLog,
    })
    const { success, severityCode } = getSeverity('success')

    return { success, severityCode, netlifyConfig: netlifyConfigA, configMutations, logs }
  } catch (error) {
    const { severity } = await handleBuildError(error, errorParams)
    const { success, severityCode } = getSeverity(severity)

    return { success, severityCode, logs }
  }
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
  systemLog,
}) {
  const configOpts = getConfigOpts({
    config,
    defaultConfig,
    featureFlags,
    mode,
    repositoryRoot,
  } as any)
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
  } as any)

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
      systemLog,
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
    } as any)

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
  systemLog,
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
    systemLog,
  } as any)

  return { netlifyConfig: netlifyConfigA, configMutations }
}
