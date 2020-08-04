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
  timers,
  testOpts,
}) {
  if (shouldSkipCommand({ event, package, error, failedPlugins })) {
    return {}
  }

  logCommand({ logs, event, buildCommandOrigin, package, index, error })

  const fireCommand = getFireCommand({ package, event })
  const { newEnvChanges, newError, newStatus, timers: timersA, durationMs } = await fireCommand({
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
    timers: timersA,
    durationMs,
    testOpts,
  })
  return { ...newValues, newIndex: index + 1 }
}

// If either:
//   - an error was thrown by the current plugin or another one
//   - the current plugin previously ran `utils.build.failPlugin()`, `failBuild()` or `cancelBuild()`
// Then:
//   - run `onError` event (otherwise not run)
//   - run `onEnd` event (always run regardless)
//   - skip other events
const shouldSkipCommand = function({ event, package, error, failedPlugins }) {
  const isError = error !== undefined || failedPlugins.includes(package)
  return (isMainCommand({ event }) && isError) || (isErrorCommand({ event }) && !isError)
}

// Wrap command function to measure its time
const getFireCommand = function({ package, event }) {
  const [metric, tag] =
    package === undefined
      ? ['build.substage.duration', 'run_netlify_build.command']
      : ['build.plugins', `${normalizeTimerName(package)}.${event}`]
  return measureDuration(tFireCommand, metric, tag)
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
  timers,
  durationMs,
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
      testOpts,
    })
  }

  logCommandSuccess(logs)

  const timerName = package === undefined ? 'build.command' : `${package} ${event}`
  logTimer(logs, durationMs, timerName)

  return { newEnvChanges, newStatus, timers }
}

module.exports = { runCommands }
