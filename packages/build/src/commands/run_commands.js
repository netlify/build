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
  featureFlags,
  buildbotServerSocket,
  events,
  configPath,
  buildDir,
  nodePath,
  childEnv,
  constants,
  mode,
  api,
  errorMonitor,
  deployId,
  netlifyConfig,
  logs,
  debug,
  timers,
  testOpts,
}) {
  const {
    index: commandsCount,
    error: errorA,
    statuses: statusesB,
    failedPlugins: failedPluginsA,
    timers: timersC,
  } = await pReduce(
    commands,
    async (
      { index, error, failedPlugins, envChanges, statuses, timers: timersA },
      {
        event,
        childProcess,
        packageName,
        coreCommand,
        coreCommandId,
        coreCommandName,
        pluginPackageJson,
        loadedFrom,
        origin,
        condition,
        buildCommand,
        buildCommandOrigin,
      },
    ) => {
      const {
        newIndex = index,
        newError = error,
        failedPlugin = [],
        newEnvChanges = {},
        newStatus,
        timers: timersB = timersA,
      } = await runCommand({
        event,
        childProcess,
        packageName,
        coreCommand,
        coreCommandId,
        coreCommandName,
        pluginPackageJson,
        loadedFrom,
        origin,
        condition,
        buildCommand,
        buildCommandOrigin,
        configPath,
        buildDir,
        nodePath,
        index,
        childEnv,
        envChanges,
        constants,
        commands,
        featureFlags,
        buildbotServerSocket,
        events,
        mode,
        api,
        errorMonitor,
        deployId,
        error,
        failedPlugins,
        netlifyConfig,
        logs,
        debug,
        timers: timersA,
        testOpts,
      })
      const statusesA = addStatus({ newStatus, statuses, event, packageName, pluginPackageJson })
      return {
        index: newIndex,
        error: newError,
        failedPlugins: [...failedPlugins, ...failedPlugin],
        envChanges: { ...envChanges, ...newEnvChanges },
        statuses: statusesA,
        timers: timersB,
      }
    },
    { index: 0, failedPlugins: [], envChanges: {}, statuses: [], timers },
  )

  // Instead of throwing any build failure right away, we wait for `onError`,
  // etc. to complete. This is why we are throwing only now.
  if (errorA !== undefined) {
    addErrorInfo(errorA, { statuses: statusesB })
    throw errorA
  }

  return { commandsCount, statuses: statusesB, failedPlugins: failedPluginsA, timers: timersC }
}

module.exports = { runCommands }
