/* eslint-disable max-lines */
'use strict'

const { addMutableConstants } = require('../core/constants')
const { logStepStart } = require('../log/messages/steps')
const { runsAlsoOnBuildFailure, runsOnlyOnBuildFailure } = require('../plugins/events')
const { measureDuration, normalizeTimerName } = require('../time/main')

const { fireCoreStep } = require('./core_step')
const { firePluginStep } = require('./plugin')
const { getStepReturn } = require('./return')

// Run a step (core, build command or plugin)
const runStep = async function ({
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
  netlifyConfig,
  configMutations,
  headersPath,
  redirectsPath,
  logs,
  debug,
  verbose,
  saveConfig,
  timers,
  testOpts,
  featureFlags,
}) {
  const constantsA = await addMutableConstants({ constants, buildDir, netlifyConfig })

  if (
    !(await shouldRunStep({
      event,
      packageName,
      error,
      failedPlugins,
      netlifyConfig,
      condition,
      constants: constantsA,
      buildbotServerSocket,
      buildDir,
    }))
  ) {
    return {}
  }

  logStepStart({ logs, event, packageName, coreStepDescription, index, error, netlifyConfig })

  const fireStep = getFireStep(packageName, coreStepId, event)
  const {
    newEnvChanges,
    netlifyConfig: netlifyConfigA = netlifyConfig,
    configMutations: configMutationsA = configMutations,
    headersPath: headersPathA = headersPath,
    redirectsPath: redirectsPathA = redirectsPath,
    newError,
    newStatus,
    timers: timersA,
    durationNs,
  } = await fireStep({
    event,
    childProcess,
    packageName,
    pluginPackageJson,
    loadedFrom,
    origin,
    coreStep,
    coreStepName,
    configPath,
    buildDir,
    repositoryRoot,
    nodePath,
    childEnv,
    context,
    branch,
    envChanges,
    constants: constantsA,
    steps,
    buildbotServerSocket,
    events,
    error,
    logs,
    debug,
    verbose,
    saveConfig,
    timers,
    errorParams,
    configOpts,
    netlifyConfig,
    configMutations,
    headersPath,
    redirectsPath,
    featureFlags,
  })

  const newValues = await getStepReturn({
    event,
    packageName,
    newError,
    newEnvChanges,
    newStatus,
    coreStep,
    coreStepName,
    childEnv,
    mode,
    api,
    errorMonitor,
    deployId,
    netlifyConfig: netlifyConfigA,
    configMutations: configMutationsA,
    headersPath: headersPathA,
    redirectsPath: redirectsPathA,
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
const shouldRunStep = async function ({
  event,
  packageName,
  error,
  failedPlugins,
  netlifyConfig,
  condition,
  constants,
  buildbotServerSocket,
  buildDir,
}) {
  if (
    failedPlugins.includes(packageName) ||
    (condition !== undefined && !(await condition({ buildDir, constants, buildbotServerSocket, netlifyConfig })))
  ) {
    return false
  }

  if (error !== undefined) {
    return runsAlsoOnBuildFailure(event)
  }

  return !runsOnlyOnBuildFailure(event)
}

// Wrap step function to measure its time
const getFireStep = function (packageName, coreStepId, event) {
  if (coreStepId !== undefined) {
    return measureDuration(tFireStep, coreStepId)
  }

  const parentTag = normalizeTimerName(packageName)
  return measureDuration(tFireStep, event, { parentTag, category: 'pluginEvent' })
}

const tFireStep = function ({
  event,
  childProcess,
  packageName,
  pluginPackageJson,
  loadedFrom,
  origin,
  coreStep,
  coreStepName,
  configPath,
  buildDir,
  repositoryRoot,
  nodePath,
  childEnv,
  context,
  branch,
  envChanges,
  constants,
  steps,
  buildbotServerSocket,
  events,
  error,
  logs,
  debug,
  verbose,
  saveConfig,
  errorParams,
  configOpts,
  netlifyConfig,
  configMutations,
  headersPath,
  redirectsPath,
  featureFlags,
}) {
  if (coreStep !== undefined) {
    return fireCoreStep({
      coreStep,
      coreStepName,
      configPath,
      buildDir,
      repositoryRoot,
      constants,
      buildbotServerSocket,
      events,
      logs,
      nodePath,
      childEnv,
      context,
      branch,
      envChanges,
      errorParams,
      configOpts,
      netlifyConfig,
      configMutations,
      headersPath,
      redirectsPath,
      featureFlags,
      debug,
      saveConfig,
    })
  }

  return firePluginStep({
    event,
    childProcess,
    packageName,
    pluginPackageJson,
    loadedFrom,
    origin,
    envChanges,
    errorParams,
    configOpts,
    netlifyConfig,
    configMutations,
    headersPath,
    redirectsPath,
    constants,
    steps,
    error,
    logs,
    debug,
    verbose,
  })
}

module.exports = { runStep }
/* eslint-enable max-lines */
