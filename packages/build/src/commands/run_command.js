/* eslint-disable max-lines */
'use strict'

const { logCommand } = require('../log/messages/commands')
const { runsAlsoOnBuildFailure, runsOnlyOnBuildFailure } = require('../plugins/events')
const { measureDuration, normalizeTimerName } = require('../time/main')

const { fireBuildCommand } = require('./build_command')
const { getConstants } = require('./constants')
const { fireCoreCommand } = require('./core_command')
const { firePluginCommand } = require('./plugin')
const { getCommandReturn } = require('./return')

// Run a command (shell or plugin)
const runCommand = async function ({
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
  timers,
  testOpts,
}) {
  const constantsA = await getConstants({ constants, buildDir })

  if (
    !shouldRunCommand({
      event,
      packageName,
      error,
      failedPlugins,
      condition,
      constants: constantsA,
      featureFlags,
      buildbotServerSocket,
    })
  ) {
    return {}
  }

  logCommand({ logs, event, buildCommandOrigin, packageName, coreCommandName, index, error })

  const fireCommand = getFireCommand({ packageName, buildCommand, coreCommandId, event })
  const {
    newEnvChanges,
    newError,
    newStatus,
    timers: timersA,
    durationNs,
  } = await fireCommand({
    event,
    childProcess,
    packageName,
    pluginPackageJson,
    loadedFrom,
    origin,
    coreCommand,
    coreCommandName,
    buildCommand,
    buildCommandOrigin,
    configPath,
    buildDir,
    nodePath,
    childEnv,
    envChanges,
    constants: constantsA,
    commands,
    buildbotServerSocket,
    events,
    error,
    logs,
    timers,
    featureFlags,
    netlifyConfig,
  })

  const newValues = await getCommandReturn({
    event,
    packageName,
    newError,
    newEnvChanges,
    newStatus,
    coreCommand,
    coreCommandName,
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
//
// Finally, some plugins (only core plugins for the moment) might be enabled or
// not depending on whether a specific action is happening during the build,
// such as creating a file. For example, the Functions and Edge handlers core
// plugins are disabled if no Functions or Edge handlers directory is specified
// or available. However, one might be created by a build plugin, in which case,
// those core plugins should be triggered. We use a dynamic `condition()` to
// model this behavior.
const shouldRunCommand = function ({
  event,
  packageName,
  error,
  failedPlugins,
  condition,
  constants,
  featureFlags,
  buildbotServerSocket,
}) {
  if (
    failedPlugins.includes(packageName) ||
    (condition !== undefined && !condition({ constants, featureFlags, buildbotServerSocket }))
  ) {
    return false
  }

  if (error !== undefined) {
    return runsAlsoOnBuildFailure(event)
  }

  return !runsOnlyOnBuildFailure(event)
}

// Wrap command function to measure its time
const getFireCommand = function ({ packageName, buildCommand, coreCommandId, event }) {
  if (coreCommandId !== undefined) {
    return measureDuration(tFireCommand, coreCommandId)
  }

  if (buildCommand !== undefined) {
    return measureDuration(tFireCommand, 'build_command')
  }

  const parentTag = normalizeTimerName(packageName)
  return measureDuration(tFireCommand, event, { parentTag, category: 'pluginEvent' })
}

const tFireCommand = function ({
  event,
  childProcess,
  packageName,
  pluginPackageJson,
  loadedFrom,
  origin,
  coreCommand,
  coreCommandName,
  buildCommand,
  buildCommandOrigin,
  configPath,
  buildDir,
  nodePath,
  childEnv,
  envChanges,
  constants,
  commands,
  buildbotServerSocket,
  events,
  error,
  logs,
  featureFlags,
  netlifyConfig,
}) {
  if (coreCommand !== undefined) {
    return fireCoreCommand({
      coreCommand,
      coreCommandName,
      buildDir,
      constants,
      buildbotServerSocket,
      events,
      logs,
      childEnv,
      featureFlags,
      netlifyConfig,
    })
  }

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
    packageName,
    pluginPackageJson,
    loadedFrom,
    origin,
    envChanges,
    constants,
    commands,
    error,
    logs,
  })
}

module.exports = { runCommand }
/* eslint-enable max-lines */
