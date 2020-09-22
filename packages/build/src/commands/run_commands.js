const pReduce = require('p-reduce')

const { addErrorInfo } = require('../error/info')
const { addStatus } = require('../status/add')

const { runCommand } = require('./run_command')

// Run all commands.
// Each command can change some state: last `error`, environment variables changes,
// list of `failedPlugins` (that ran `utils.build.failPlugin()`).
// If an error arises, runs `onError` events.
// Runs `onEnd` events at the end, whether an error was thrown or not.
const runCommands = async function({
  commands,
  configPath,
  buildDir,
  nodePath,
  childEnv,
  mode,
  api,
  errorMonitor,
  deployId,
  netlifyConfig,
  logs,
  debug,
  timers,
  testOpts,
  featureFlags,
}) {
  const { index: commandsCount, error: errorA, statuses: statusesB, timers: timersC } = await pReduce(
    commands,
    async (
      { index, error, failedPlugins, envChanges, statuses, timers: timersA },
      { event, childProcess, package, pluginPackageJson, loadedFrom, origin, buildCommand, buildCommandOrigin },
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
        package,
        pluginPackageJson,
        loadedFrom,
        origin,
        buildCommand,
        buildCommandOrigin,
        configPath,
        buildDir,
        nodePath,
        index,
        childEnv,
        envChanges,
        commands,
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
        featureFlags,
      })
      const statusesA = addStatus({ newStatus, statuses, event, package, pluginPackageJson })
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

  return { commandsCount, statuses: statusesB, timers: timersC }
}

module.exports = { runCommands }
