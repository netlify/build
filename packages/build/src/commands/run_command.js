const { logCommand } = require('../log/messages/commands')
const { measureDuration, normalizeTimerName } = require('../time/main')

const { fireBuildCommand } = require('./build_command')
const { runsAlsoOnBuildFailure, runsOnlyOnBuildFailure } = require('./get')
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

// A plugin fails _without making the build fail_ when either:
//   - using `utils.build.failPlugin()`
//   - the failure happens after deploy. This means: inside any `onError`,
//     `onSuccess` or `onEnd` event handler.
//
// When that happens, no other events for that specific plugin is run.
// Not even `onError` and `onEnd`.
// Plugins should use `try`/`catch`/`finally` blocks to handle exceptions,
// not `onError` nor `onEnd`.
//
// Otherwise, most failures will make the build fail. This includes:
//   - the build command failed
//   - Functions or Edge handlers bundling failed
//   - the deploy failed (deploying files to our CDN)
//   - a plugin `onPreBuild`, `onBuild` or `onPostBuild` event handler failed.
//     This includes uncaught exceptions and using `utils.build.failBuild()`
//     or `utils.build.cancelBuild()`.
//
// `onError` is triggered when the build failed.
// It means "on build failure" not "on plugin failure".
// `onSuccess` is the opposite. It is triggered after the build succeeded.
// `onEnd` is triggered after the build either failed or succeeded.
// It is useful for resources cleanup.
const shouldRunCommand = function({ event, package, error, failedPlugins }) {
  if (failedPlugins.includes(package)) {
    return false
  }

  if (error !== undefined) {
    return runsAlsoOnBuildFailure(event)
  }

  return !runsOnlyOnBuildFailure(event)
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
