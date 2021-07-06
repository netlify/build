/* eslint-disable max-lines */
'use strict'

const pReduce = require('p-reduce')

const { addErrorInfo } = require('../error/info')
const { addStatus } = require('../status/add')

const { runCommand } = require('./run_command')

// Run all commands.
// Each command can change some state: last `error`, environment variables changes,
// list of `failedPlugins` (that ran `utils.build.failPlugin()`).
// If an error arises, runs `onError` events.
// Runs `onEnd` events at the end, whether an error was thrown or not.
const runCommands = async function ({
  commands,
  buildbotServerSocket,
  events,
  configPath,
  redirectsPath,
  buildDir,
  nodePath,
  childEnv,
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
  timers,
  testOpts,
  featureFlags,
}) {
  const {
    index: commandsCount,
    error: errorA,
    netlifyConfig: netlifyConfigC,
    configMutations: configMutationsB,
    redirectsPath: redirectsPathC,
    statuses: statusesB,
    failedPlugins: failedPluginsA,
    timers: timersC,
  } = await pReduce(
    commands,
    async (
      {
        index,
        error,
        failedPlugins,
        envChanges,
        netlifyConfig: netlifyConfigA,
        configMutations,
        redirectsPath: redirectsPathA,
        statuses,
        timers: timersA,
      },
      {
        event,
        childProcess,
        packageName,
        coreCommand,
        coreCommandId,
        coreCommandName,
        coreCommandDescription,
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
        redirectsPath: redirectsPathB = redirectsPathA,
        newStatus,
        timers: timersB = timersA,
      } = await runCommand({
        event,
        childProcess,
        packageName,
        coreCommand,
        coreCommandId,
        coreCommandName,
        coreCommandDescription,
        pluginPackageJson,
        loadedFrom,
        origin,
        condition,
        configPath,
        buildDir,
        nodePath,
        index,
        childEnv,
        envChanges,
        constants,
        commands,
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
        redirectsPath: redirectsPathA,
        logs,
        debug,
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
    commandsCount,
    netlifyConfig: netlifyConfigC,
    configMutations: configMutationsB,
    redirectsPath: redirectsPathC,
    statuses: statusesB,
    failedPlugins: failedPluginsA,
    timers: timersC,
  }
}

module.exports = { runCommands }
/* eslint-enable max-lines */
