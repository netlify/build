import { addErrorInfo } from '../error/info.js'
import { addStatus } from '../status/add.js'

import { runStep } from './run_step.js'

// Run all steps.
// Each step can change some state: last `error`, environment variables changes,
// list of `failedPlugins` (that ran `utils.build.failPlugin()`).
// If an error arises, runs `onError` events.
// Runs `onEnd` events at the end, whether an error was thrown or not.
export const runSteps = async function ({
  defaultConfig,
  steps,
  buildbotServerSocket,
  events,
  configPath,
  outputConfigPath,
  headersPath,
  redirectsPath,
  buildDir,
  packagePath,
  repositoryRoot,
  nodePath,
  childEnv,
  context,
  branch,
  constants,
  mode,
  api,
  errorMonitor,
  deployId,
  errorParams,
  netlifyConfig,
  configOpts,
  logs,
  debug,
  systemLog,
  verbose,
  saveConfig,
  timers,
  testOpts,
  featureFlags,
  quiet,
  userNodeVersion,
  explicitSecretKeys,
  enhancedSecretScan,
  edgeFunctionsBootstrapURL,
}) {
  let index = 0
  let error
  const deployEnvVarsByKey = new Map()
  let deployEnvVars = []
  const failedPlugins = []
  const envChanges = {}
  let configMutations = []
  let statuses = []
  const metrics = []
  const returnValues = {}

  for (const {
    event,
    childProcess,
    packageName,
    extensionMetadata,
    coreStep,
    coreStepId,
    coreStepName,
    coreStepDescription,
    pluginPackageJson,
    loadedFrom,
    origin,
    condition,
    quiet: coreStepQuiet,
  } of steps) {
    const {
      newIndex = index,
      newError = error,
      deployEnvVars: newDeployEnvVars = [],
      failedPlugin = [],
      newEnvChanges = {},
      netlifyConfig: newNetlifyConfig = netlifyConfig,
      configMutations: newConfigMutations = configMutations,
      headersPath: newHeadersPath = headersPath,
      redirectsPath: newRedirectsPath = redirectsPath,
      newStatus,
      timers: newTimers = timers,
      metrics: newMetrics = [],
      returnValue,
    } = await runStep({
      deployEnvVars,
      event,
      childProcess,
      packageName,
      extensionMetadata,
      coreStep,
      coreStepId,
      coreStepName,
      coreStepDescription,
      coreStepQuiet,
      pluginPackageJson,
      loadedFrom,
      origin,
      condition,
      configPath,
      outputConfigPath,
      buildDir,
      packagePath,
      repositoryRoot,
      nodePath,
      index,
      childEnv,
      context,
      branch,
      envChanges,
      constants,
      steps,
      buildbotServerSocket,
      events,
      mode,
      api,
      errorMonitor,
      deployId,
      errorParams,
      error,
      returnValues,
      failedPlugins,
      configOpts,
      defaultConfig,
      netlifyConfig,
      configMutations,
      headersPath,
      redirectsPath,
      logs,
      debug,
      systemLog,
      verbose,
      saveConfig,
      timers,
      testOpts,
      featureFlags,
      quiet,
      userNodeVersion,
      explicitSecretKeys,
      enhancedSecretScan,
      edgeFunctionsBootstrapURL,
    })

    index = newIndex
    error = newError
    netlifyConfig = newNetlifyConfig
    headersPath = newHeadersPath
    redirectsPath = newRedirectsPath
    timers = newTimers
    statuses = addStatus({ newStatus, statuses, event, packageName, pluginPackageJson })

    if (newDeployEnvVars.length !== 0) {
      for (const env of deployEnvVars) {
        deployEnvVarsByKey.set(env.key, env)
      }
      for (const env of newDeployEnvVars) {
        deployEnvVarsByKey.set(env.key, env)
      }
      deployEnvVars = Array.from(deployEnvVarsByKey.values())
    }
    failedPlugins.push(...failedPlugin)
    Object.assign(envChanges, newEnvChanges)
    configMutations = newConfigMutations
    metrics.push(...newMetrics)

    if (returnValue) {
      returnValues[packageName] = /** @type {import('../steps/return_values.js').ReturnValue} */ ({
        ...returnValue,
        displayName: extensionMetadata?.name || extensionMetadata?.slug || packageName,
        generatorType: extensionMetadata ? 'extension' : 'build plugin',
      })
    }
  }

  // Instead of throwing any build failure right away, we wait for `onError`,
  // etc. to complete. This is why we are throwing only now.
  if (error !== undefined) {
    addErrorInfo(error, { statuses })
    throw error
  }

  return {
    stepsCount: index,
    netlifyConfig,
    statuses,
    failedPlugins,
    timers,
    configMutations,
    metrics,
    returnValues,
    deployEnvVars,
  }
}
