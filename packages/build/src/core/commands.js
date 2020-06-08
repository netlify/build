const { platform } = require('process')

const execa = require('execa')
const pReduce = require('p-reduce')

const { setEnvChanges } = require('../env/changes.js')
const { addErrorInfo, getErrorInfo } = require('../error/info')
const { reportBuildError } = require('../error/monitor/report')
const { serializeErrorStatus } = require('../error/parse/serialize_status')
const { logCommand, logBuildCommandStart, logCommandSuccess, logBuildError } = require('../log/main')
const {
  getBuildCommandStdio,
  handleBuildCommandOutput,
  pipePluginOutput,
  unpipePluginOutput,
} = require('../log/stream')
const { startTimer, endTimer } = require('../log/timer')
const { EVENTS } = require('../plugins/events')
const { callChild } = require('../plugins/ipc')
const { getSuccessStatus, addStatus } = require('../status/add')

// Get commands for all events
const getCommands = function(pluginsCommands, netlifyConfig) {
  const commands = addBuildCommand(pluginsCommands, netlifyConfig)
  const commandsA = sortCommands(commands)
  const commandsCount = commandsA.filter(isSuccessCommand).length
  return { commands: commandsA, commandsCount }
}

// Merge `build.command` with plugin event handlers
const addBuildCommand = function(pluginsCommands, { build: { command: buildCommand } }) {
  if (buildCommand === undefined) {
    return pluginsCommands
  }

  return [{ event: 'onBuild', buildCommand }, ...pluginsCommands]
}

// Sort plugin commands by event order.
const sortCommands = function(commands) {
  return EVENTS.flatMap(event => commands.filter(command => command.event === event))
}

const isMainCommand = function({ event }) {
  return event !== 'onEnd' && event !== 'onError'
}

const isEndCommand = function({ event }) {
  return event === 'onEnd'
}

const isErrorCommand = function({ event }) {
  return event === 'onError'
}

const isSuccessCommand = function({ event }) {
  return isMainCommand({ event }) || isEndCommand({ event })
}

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
  errorMonitor,
  netlifyConfig,
  logs,
  testOpts,
}) {
  const { index: commandsCount, error: errorA, statuses: statusesB } = await pReduce(
    commands,
    async (
      { index, error, failedPlugins, envChanges, statuses },
      { event, childProcess, package, packageJson, loadedFrom, origin, buildCommand },
    ) => {
      const { newIndex = index, newError = error, failedPlugin = [], newEnvChanges = {}, newStatus } = await runCommand(
        {
          event,
          childProcess,
          package,
          packageJson,
          loadedFrom,
          origin,
          buildCommand,
          configPath,
          buildDir,
          nodePath,
          index,
          childEnv,
          envChanges,
          commands,
          errorMonitor,
          error,
          failedPlugins,
          netlifyConfig,
          logs,
          testOpts,
        },
      )
      const statusesA = addStatus({ newStatus, statuses, event, package, packageJson })
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
  return { commandsCount, error: errorA, statuses: statusesB }
}

// Run a command (shell or plugin)
const runCommand = async function({
  event,
  childProcess,
  package,
  packageJson,
  loadedFrom,
  origin,
  buildCommand,
  configPath,
  buildDir,
  nodePath,
  index,
  childEnv,
  envChanges,
  commands,
  errorMonitor,
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

  logCommand({ logs, event, package, index, configPath, error })

  const { newEnvChanges, newError, newStatus } = await fireCommand({
    event,
    childProcess,
    package,
    packageJson,
    loadedFrom,
    origin,
    buildCommand,
    configPath,
    buildDir,
    nodePath,
    childEnv,
    envChanges,
    commands,
    error,
    logs,
  })

  const newValues =
    newError === undefined
      ? handleCommandSuccess({ event, package, newEnvChanges, newStatus, methodTimer, logs })
      : await handleCommandError({ newError, errorMonitor, buildCommand, netlifyConfig, logs, testOpts })
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
  packageJson,
  loadedFrom,
  origin,
  buildCommand,
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
    return fireBuildCommand({ buildCommand, configPath, buildDir, nodePath, childEnv, envChanges, logs })
  }

  return firePluginCommand({
    event,
    childProcess,
    package,
    packageJson,
    loadedFrom,
    origin,
    envChanges,
    commands,
    error,
    logs,
  })
}

// Fire `build.command`
const fireBuildCommand = async function({ buildCommand, configPath, buildDir, nodePath, childEnv, envChanges, logs }) {
  logBuildCommandStart(logs, buildCommand)

  const env = setEnvChanges(envChanges, { ...childEnv })
  const stdio = getBuildCommandStdio(logs)
  const childProcess = execa(buildCommand, {
    shell: SHELL,
    cwd: buildDir,
    preferLocal: true,
    execPath: nodePath,
    env,
    extendEnv: false,
    stdio,
  })

  try {
    const buildCommandOutput = await childProcess
    handleBuildCommandOutput(buildCommandOutput, logs)
    return {}
  } catch (newError) {
    handleBuildCommandOutput(newError, logs)
    addErrorInfo(newError, { type: 'buildCommand', location: { buildCommand, configPath } })
    return { newError }
  }
}

// We use Bash on Unix and `cmd.exe` on Windows
const SHELL = platform === 'win32' ? true : 'bash'

// Fire a plugin command
const firePluginCommand = async function({
  event,
  childProcess,
  package,
  packageJson,
  loadedFrom,
  origin,
  envChanges,
  commands,
  error,
  logs,
}) {
  const listeners = pipePluginOutput(childProcess, logs)

  try {
    const { newEnvChanges, status } = await callChild(
      childProcess,
      'run',
      { event, error, envChanges },
      { plugin: { packageJson, package }, location: { event, package, loadedFrom, origin } },
    )
    const newStatus = getSuccessStatus(status, { commands, event, package })
    return { newEnvChanges, newStatus }
  } catch (newError) {
    return { newError }
  } finally {
    await unpipePluginOutput(childProcess, logs, listeners)
  }
}

// `build.command` or plugin event handle success
const handleCommandSuccess = function({ event, package, newEnvChanges, newStatus, methodTimer, logs }) {
  logCommandSuccess(logs)

  const timerName = package === undefined ? 'build.command' : `${package} ${event}`
  endTimer(logs, methodTimer, timerName)

  return { newEnvChanges, newStatus }
}

// Handle shell or plugin error:
//  - usually (`failFast`), propagate the error to make the build stop.
//  - if onError and onEnd events (not `failFast`), wait until all event
//    handlers of the same type have been triggered before propagating
//  - if `utils.build.failPlugin()` was used, print an error and skip next event
//    handlers of that plugin. But do not stop build.
const handleCommandError = async function({ newError, errorMonitor, buildCommand, netlifyConfig, logs, testOpts }) {
  // `build.command` do not report error statuses
  if (buildCommand !== undefined) {
    return { newError }
  }

  const { type, location: { package } = {} } = getErrorInfo(newError)
  const newStatus = serializeErrorStatus(newError)

  if (type === 'failPlugin') {
    return handleFailPlugin({ newStatus, package, newError, errorMonitor, netlifyConfig, logs, testOpts })
  }

  return { newError, newStatus }
}
const handleFailPlugin = async function({ newStatus, package, newError, errorMonitor, netlifyConfig, logs, testOpts }) {
  logBuildError({ error: newError, netlifyConfig, logs })
  await reportBuildError({ error: newError, errorMonitor, logs, testOpts })
  return { failedPlugin: [package], newStatus }
}

module.exports = { getCommands, isSuccessCommand, runCommands }
