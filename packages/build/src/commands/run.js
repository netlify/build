const pReduce = require('p-reduce')

const { addErrorInfo } = require('../error/info')
const { logCommand, logCommandSuccess } = require('../log/main')
const { startTimer, endTimer } = require('../log/timer')
const { addStatus } = require('../status/add')

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
  testOpts,
}) {
  const { index: commandsCount, error: errorA, statuses: statusesB } = await pReduce(
    commands,
    async (
      { index, error, failedPlugins, envChanges, statuses },
      { event, childProcess, package, pluginPackageJson, loadedFrom, origin, buildCommand, buildCommandOrigin },
    ) => {
      const { newIndex = index, newError = error, failedPlugin = [], newEnvChanges = {}, newStatus } = await runCommand(
        {
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
          testOpts,
        },
      )
      const statusesA = addStatus({ newStatus, statuses, event, package, pluginPackageJson })
      return {
        index: newIndex,
        error: newError,
        failedPlugins: [...failedPlugins, ...failedPlugin],
        envChanges: { ...envChanges, ...newEnvChanges },
        statuses: statusesA,
      }
    },
    { index: 0, failedPlugins: [], envChanges: {}, statuses: [] },
  )

  // Instead of throwing any build failure right away, we wait for `onError`,
  // etc. to complete. This is why we are throwing only now.
  if (errorA !== undefined) {
    addErrorInfo(errorA, { statuses: statusesB })
    throw errorA
  }

  return { commandsCount, statuses: statusesB }
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
  testOpts,
}) {
  if (shouldSkipCommand({ event, package, error, failedPlugins })) {
    return {}
  }

  const methodTimer = startTimer()

  logCommand({ logs, event, buildCommandOrigin, package, index, error })

  const { newEnvChanges, newError, newStatus } = await fireCommand({
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
  })

  const newValues = await getNewValues({
    event,
    package,
    newError,
    newEnvChanges,
    newStatus,
    methodTimer,
    buildCommand,
    childEnv,
    mode,
    api,
    errorMonitor,
    deployId,
    netlifyConfig,
    logs,
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

const fireCommand = function({
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
  methodTimer,
  buildCommand,
  childEnv,
  mode,
  api,
  errorMonitor,
  deployId,
  netlifyConfig,
  logs,
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
  endTimer(logs, methodTimer, timerName)

  return { newEnvChanges, newStatus }
}

module.exports = { runCommands }
