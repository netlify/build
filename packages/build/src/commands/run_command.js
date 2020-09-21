const { logCommand } = require('../log/main')
const { measureDuration, normalizeTimerName } = require('../time/main')

const { fireBuildCommand } = require('./build_command')
const { isErrorEvent, isErrorOnlyEvent } = require('./get')
const { firePluginCommand } = require('./plugin')
const { getCommandReturn } = require('./return')

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
  featureFlags,
}) {
  if (!shouldRunCommand({ event, package, error, failedPlugins })) {
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

  const newValues = await getCommandReturn({
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
    featureFlags,
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
const shouldRunCommand = function({ event, package, error, failedPlugins }) {
  const isError = error !== undefined || failedPlugins.includes(package)
  if (isError) {
    return isErrorEvent(event)
  }

  return !isErrorOnlyEvent(event)
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

module.exports = { runCommand }
