const pReduce = require('p-reduce')

const { addErrorInfo } = require('../error/info')
const { logCommand, logCommandSuccess } = require('../log/main')
const { logTimer } = require('../log/main')
const { addStatus } = require('../status/add')
const { measureDuration, normalizeTimerName } = require('../time/main')

const { fireBuildCommand } = require('./build_command')
const { handleCommandError } = require('./error')
const { isMainCommand, isErrorCommand } = require('./get')
const { firePluginCommand } = require('./plugin')

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

// Run a command (shell or plugin)
const runCommand = async function({
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
  timers,
  testOpts,
}) {
  if (shouldSkipCommand({ event, package, error, failedPlugins })) {
    return {}
  }

  logCommand({ logs, event, buildCommandOrigin, package, index, error })

  const fireCommand = getFireCommand({ package, event })
  const { newEnvChanges, newError, newStatus, timers: timersA, durationNs } = await fireCommand({
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
    childEnv,
    envChanges,
    commands,
    error,
    logs,
    timers,
  })

  const newValues = await getNewValues({
    event,
    package,
    newError,
    newEnvChanges,
    newStatus,
    buildCommand,
    childEnv,
    mode,
    api,
    errorMonitor,
    deployId,
    netlifyConfig,
    logs,
    debug,
    timers: timersA,
    durationNs,
    testOpts,
  })
  return { ...newValues, newIndex: index + 1 }
}

// If a plugin throws an uncaught exception, uses `utils.build.failBuild()` or
// uses `utils.build.cancelBuild()`:
//   - the build and the plugin fail
//   - all events for all plugins are skipped, except `onError` and `onEnd`
//   - the `onError` events for all plugins are run
// If a plugin uses `utils.build.failPlugin()`:
//   - the build does not fail, but the plugin does
//   - all events for the current plugin are skipped, except `onError` and `onEnd`
//   - the `onError` event for the current plugin is run
//   - other plugins are not impacted
// `onError()` is not run otherwise.
// `onEnd()` is always run, regardless of whether the current or other plugins
// failed.
const shouldSkipCommand = function({ event, package, error, failedPlugins }) {
  const isError = error !== undefined || failedPlugins.includes(package)
  return (isMainCommand({ event }) && isError) || (isErrorCommand({ event }) && !isError)
}

// Wrap command function to measure its time
const getFireCommand = function({ package, event }) {
  if (package === undefined) {
    return measureDuration(tFireCommand, 'build_command')
  }

  const parentTag = normalizeTimerName(package)
  return measureDuration(tFireCommand, event, { parentTag, category: 'pluginEvent' })
}

const tFireCommand = function({
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
  childEnv,
  envChanges,
  commands,
  error,
  logs,
}) {
  if (buildCommand !== undefined) {
    return fireBuildCommand({
      buildCommand,
      buildCommandOrigin,
      configPath,
      buildDir,
      nodePath,
      childEnv,
      envChanges,
      logs,
    })
  }

  return firePluginCommand({
    event,
    childProcess,
    package,
    pluginPackageJson,
    loadedFrom,
    origin,
    envChanges,
    commands,
    error,
    logs,
  })
}

const getNewValues = function({
  event,
  package,
  newError,
  newEnvChanges,
  newStatus,
  buildCommand,
  childEnv,
  mode,
  api,
  errorMonitor,
  deployId,
  netlifyConfig,
  logs,
  debug,
  timers,
  durationNs,
  testOpts,
}) {
  if (newError !== undefined) {
    return handleCommandError({
      newError,
      childEnv,
      mode,
      api,
      errorMonitor,
      deployId,
      buildCommand,
      netlifyConfig,
      logs,
      debug,
      testOpts,
    })
  }

  logCommandSuccess(logs)

  const timerName = package === undefined ? 'build.command' : `${package} ${event}`
  logTimer(logs, durationNs, timerName)

  return { newEnvChanges, newStatus, timers }
}

module.exports = { runCommands }
