import pReduce from 'p-reduce'

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
  const {
    index: stepsCount,
    error: errorA,
    netlifyConfig: netlifyConfigC,
    statuses: statusesB,
    failedPlugins: failedPluginsA,
    timers: timersC,
    configMutations: configMutationsB,
    metrics: metricsC,
    returnValues,
    deployEnvVars,
  } = await pReduce(
    steps,
    async (
      {
        deployEnvVars,
        index,
        error,
        failedPlugins,
        envChanges,
        netlifyConfig: netlifyConfigA,
        configMutations,
        headersPath: headersPathA,
        redirectsPath: redirectsPathA,
        statuses,
        timers: timersA,
        metrics: metricsA,
        returnValues,
      },
      {
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
      },
    ) => {
      const {
        newIndex = index,
        newError = error,
        deployEnvVars: newDeployEnvVars = [],
        failedPlugin = [],
        newEnvChanges = {},
        netlifyConfig: netlifyConfigB = netlifyConfigA,
        configMutations: configMutationsA = configMutations,
        headersPath: headersPathB = headersPathA,
        redirectsPath: redirectsPathB = redirectsPathA,
        newStatus,
        timers: timersB = timersA,
        metrics: metricsB = [],
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
        netlifyConfig: netlifyConfigA,
        configMutations,
        headersPath: headersPathA,
        redirectsPath: redirectsPathA,
        logs,
        debug,
        systemLog,
        verbose,
        saveConfig,
        timers: timersA,
        testOpts,
        featureFlags,
        quiet,
        userNodeVersion,
        explicitSecretKeys,
        enhancedSecretScan,
        edgeFunctionsBootstrapURL,
      })

      const statusesA = addStatus({ newStatus, statuses, event, packageName, pluginPackageJson })

      /** @type import('../steps/return_values.js').ReturnValue */
      const augmentedReturnValue = returnValue
        ? {
            ...returnValue,
            displayName: extensionMetadata?.name || extensionMetadata?.slug || packageName,
            generatorType: extensionMetadata ? 'extension' : 'build plugin',
          }
        : undefined

      return {
        index: newIndex,
        error: newError,
        deployEnvVars: Array.from(
          [...deployEnvVars, ...newDeployEnvVars].reduce((acc, env) => acc.set(env.key, env), new Map()).values(),
        ),
        failedPlugins: [...failedPlugins, ...failedPlugin],
        envChanges: { ...envChanges, ...newEnvChanges },
        netlifyConfig: netlifyConfigB,
        configMutations: configMutationsA,
        headersPath: headersPathB,
        redirectsPath: redirectsPathB,
        statuses: statusesA,
        timers: timersB,
        metrics: [...metricsA, ...metricsB],
        returnValues: augmentedReturnValue ? { ...returnValues, [packageName]: augmentedReturnValue } : returnValues,
      }
    },
    {
      index: 0,
      deployEnvVars: [],
      failedPlugins: [],
      envChanges: {},
      netlifyConfig,
      configMutations: [],
      headersPath,
      redirectsPath,
      statuses: [],
      timers,
      metrics: [],
      returnValues: {},
    },
  )

  // Instead of throwing any build failure right away, we wait for `onError`,
  // etc. to complete. This is why we are throwing only now.
  if (errorA !== undefined) {
    addErrorInfo(errorA, { statuses: statusesB })
    throw errorA
  }

  return {
    stepsCount,
    netlifyConfig: netlifyConfigC,
    statuses: statusesB,
    failedPlugins: failedPluginsA,
    timers: timersC,
    configMutations: configMutationsB,
    metrics: metricsC,
    returnValues,
    deployEnvVars,
  }
}
