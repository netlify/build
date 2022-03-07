/* eslint-disable max-lines */
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
  steps,
  buildbotServerSocket,
  events,
  configPath,
  headersPath,
  redirectsPath,
  buildDir,
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
  verbose,
  saveConfig,
  timers,
  testOpts,
  featureFlags,
}) {
  const {
    index: stepsCount,
    error: errorA,
    netlifyConfig: netlifyConfigC,
    statuses: statusesB,
    failedPlugins: failedPluginsA,
    timers: timersC,
    configMutations: configMutationsB,
  } = await pReduce(
    steps,
    async (
      {
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
      },
      {
        event,
        childProcess,
        packageName,
        coreStep,
        coreStepId,
        coreStepName,
        coreStepDescription,
        pluginPackageJson,
        loadedFrom,
        origin,
        condition,
      },
    ) => {
      const {
        newIndex = index,
        newError = error,
        failedPlugin = [],
        newEnvChanges = {},
        netlifyConfig: netlifyConfigB = netlifyConfigA,
        configMutations: configMutationsA = configMutations,
        headersPath: headersPathB = headersPathA,
        redirectsPath: redirectsPathB = redirectsPathA,
        newStatus,
        timers: timersB = timersA,
      } = await runStep({
        event,
        childProcess,
        packageName,
        coreStep,
        coreStepId,
        coreStepName,
        coreStepDescription,
        pluginPackageJson,
        loadedFrom,
        origin,
        condition,
        configPath,
        buildDir,
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
        failedPlugins,
        configOpts,
        netlifyConfig: netlifyConfigA,
        configMutations,
        headersPath: headersPathA,
        redirectsPath: redirectsPathA,
        logs,
        debug,
        verbose,
        saveConfig,
        timers: timersA,
        testOpts,
        featureFlags,
      })
      const statusesA = addStatus({ newStatus, statuses, event, packageName, pluginPackageJson })
      return {
        index: newIndex,
        error: newError,
        failedPlugins: [...failedPlugins, ...failedPlugin],
        envChanges: { ...envChanges, ...newEnvChanges },
        netlifyConfig: netlifyConfigB,
        configMutations: configMutationsA,
        headersPath: headersPathB,
        redirectsPath: redirectsPathB,
        statuses: statusesA,
        timers: timersB,
      }
    },
    {
      index: 0,
      failedPlugins: [],
      envChanges: {},
      netlifyConfig,
      configMutations: [],
      headersPath,
      redirectsPath,
      statuses: [],
      timers,
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
  }
}
/* eslint-enable max-lines */
