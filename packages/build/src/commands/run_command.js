/* eslint-disable max-lines */
'use strict'

const { addMutableConstants } = require('../core/constants')
const { logCommand } = require('../log/messages/commands')
const { runsAlsoOnBuildFailure, runsOnlyOnBuildFailure } = require('../plugins/events')
const { measureDuration, normalizeTimerName } = require('../time/main')

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
  netlifyConfig,
  priorityConfig,
  context,
  branch,
  logs,
  debug,
  timers,
  testOpts,
  featureFlags,
}) {
  const constantsA = await addMutableConstants({ constants, buildDir, netlifyConfig })

  if (
    !shouldRunCommand({
      event,
      packageName,
      error,
      failedPlugins,
      netlifyConfig,
      condition,
      constants: constantsA,
      buildbotServerSocket,
    })
  ) {
    return {}
  }

  logCommand({ logs, event, packageName, coreCommandDescription, index, error, netlifyConfig })

  const fireCommand = getFireCommand(packageName, coreCommandId, event)
  const {
    newEnvChanges,
    netlifyConfig: netlifyConfigA = netlifyConfig,
    priorityConfig: priorityConfigA = priorityConfig,
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
    debug,
    timers,
    errorParams,
    configOpts,
    netlifyConfig,
    priorityConfig,
    context,
    branch,
    featureFlags,
  })

  const newValues = await getCommandReturn({
    event,
    packageName,
    newError,
    newEnvChanges,
    newStatus,
    coreCommand,
    coreCommandName,
    childEnv,
    mode,
    api,
    errorMonitor,
    deployId,
    netlifyConfig: netlifyConfigA,
    priorityConfig: priorityConfigA,
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
  netlifyConfig,
  condition,
  constants,
  buildbotServerSocket,
}) {
  if (
    failedPlugins.includes(packageName) ||
    (condition !== undefined && !condition({ constants, buildbotServerSocket, netlifyConfig }))
  ) {
    return false
  }

  if (error !== undefined) {
    return runsAlsoOnBuildFailure(event)
  }

  return !runsOnlyOnBuildFailure(event)
}

// Wrap command function to measure its time
const getFireCommand = function (packageName, coreCommandId, event) {
  if (coreCommandId !== undefined) {
    return measureDuration(tFireCommand, coreCommandId)
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
  debug,
  errorParams,
  configOpts,
  netlifyConfig,
  priorityConfig,
  context,
  branch,
  featureFlags,
}) {
  if (coreCommand !== undefined) {
    return fireCoreCommand({
      coreCommand,
      coreCommandName,
      configPath,
      buildDir,
      constants,
      buildbotServerSocket,
      events,
      logs,
      nodePath,
      childEnv,
      envChanges,
      errorParams,
      configOpts,
      netlifyConfig,
      priorityConfig,
      context,
      branch,
      featureFlags,
      debug,
    })
  }

  return firePluginCommand({
    event,
    childProcess,
    packageName,
    pluginPackageJson,
    loadedFrom,
    origin,
    buildDir,
    envChanges,
    errorParams,
    configOpts,
    netlifyConfig,
    priorityConfig,
    context,
    branch,
    constants,
    commands,
    error,
    logs,
    debug,
  })
}

module.exports = { runCommand }
/* eslint-enable max-lines */
