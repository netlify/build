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

const getBuildSteps = function (buildSteps: string[]) {
  const allSteps = getSteps([]).steps.filter(({ coreStepId }) => buildSteps.includes(coreStepId))

  return allSteps
}

const executeBuildStep = async function ({
  config,
  packagePath,
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
  edgeFunctionsBootstrapURL,
  deployId,
  token,
  quiet,
}) {
  const configOpts = getConfigOpts({
    config,
    defaultConfig,
    featureFlags,
    mode,
    repositoryRoot,
    packagePath,
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
    quiet,
    nodePath,
    timers: [],
  })
  const constants = await getConstants({
    buildDir,
    functionsDistDir,
    packagePath,
    edgeFunctionsDistDir,
    netlifyConfig,
    siteInfo,
    mode,
    token,
  } as any)

  Object.assign(errorParams, { netlifyConfig, siteInfo, childEnv, userNodeVersion })

  try {
    const { netlifyConfig: netlifyConfigA, configMutations } = await runBuildStep({
      defaultConfig,
      netlifyConfig,
      buildDir,
      nodePath,
      logs,
      debug,
      constants,
      featureFlags,
      packagePath,
      childEnv,
      buildSteps,
      repositoryRoot: repositoryRootA,
      systemLog,
      edgeFunctionsBootstrapURL,
      deployId,
      quiet,
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
  defaultConfig,
  netlifyConfig,
  buildDir,
  nodePath,
  constants,
  logs,
  debug,
  featureFlags,
  packagePath,
  childEnv,
  buildSteps,
  repositoryRoot,
  systemLog,
  edgeFunctionsBootstrapURL,
  deployId,
  quiet,
}) {
  const {
    netlifyConfig: netlifyConfigA,
    configMutations,
    deployEnvVars,
  } = await runSteps({
    steps: getBuildSteps(buildSteps),
    buildDir,
    nodePath,
    constants,
    netlifyConfig,
    defaultConfig,
    logs,
    debug,
    timers: [],
    packagePath,
    featureFlags,
    childEnv,
    repositoryRoot,
    systemLog,
    edgeFunctionsBootstrapURL,
    deployId,
    quiet,
  } as any)

  return { deployEnvVars, netlifyConfig: netlifyConfigA, configMutations }
}
