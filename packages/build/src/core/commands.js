const { platform } = require('process')

const execa = require('execa')
const pReduce = require('p-reduce')

const { setEnvChanges } = require('../env/changes.js')
const { addErrorInfo, getErrorInfo } = require('../error/info')
const { reportBuildError } = require('../error/monitor/report')
const { logCommand, logBuildCommandStart, logCommandSuccess, logPluginError } = require('../log/main')
const { pipeOutput, unpipeOutput } = require('../log/stream')
const { startTimer, endTimer } = require('../log/timer')
const { EVENTS } = require('../plugins/events')
const { callChild } = require('../plugins/ipc')

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
// If an error arises, runs `onError` events.
// Runs `onEnd` events at the end, whether an error was thrown or not.
const runCommands = async function({ commands, configPath, buildDir, nodePath, childEnv, errorMonitor }) {
  // We have to use a state variable to keep track of how many commands were run
  // before an error is thrown, so that error handlers are correctly numbered
  const state = { index: 0 }

  try {
    const mainCommands = commands.filter(isMainCommand)
    await execCommands(mainCommands, {
      configPath,
      buildDir,
      state,
      nodePath,
      childEnv,
      errorMonitor,
      failFast: true,
    })
  } catch (error) {
    const errorCommands = commands.filter(isErrorCommand)
    await execCommands(errorCommands, {
      configPath,
      buildDir,
      state,
      nodePath,
      childEnv,
      errorMonitor,
      failFast: false,
      error,
    })
    throw error
  } finally {
    const endCommands = commands.filter(isEndCommand)
    await execCommands(endCommands, {
      configPath,
      buildDir,
      state,
      nodePath,
      childEnv,
      errorMonitor,
      failFast: false,
    })
  }
}

// Run a set of commands.
// `onError` and `onEnd` do not `failFast`, i.e. if they fail, the other events
// of the same name keep running. However the failure is still eventually
// thrown. This allows users to be notified of issues inside their `onError` or
// `onEnd` events.
const execCommands = async function(
  commands,
  { configPath, buildDir, state, nodePath, childEnv, errorMonitor, failFast, error },
) {
  const { failure } = await pReduce(
    commands,
    (
      { failure, failedPlugins, envChanges: envChangesA },
      { event, childProcess, package, packageJson, local, buildCommand },
    ) =>
      runCommand({
        event,
        childProcess,
        package,
        packageJson,
        local,
        buildCommand,
        configPath,
        buildDir,
        state,
        nodePath,
        childEnv,
        envChanges: envChangesA,
        errorMonitor,
        error,
        failure,
        failedPlugins,
        failFast,
      }),
    { failedPlugins: [], envChanges: {} },
  )

  if (failure !== undefined) {
    throw failure
  }
}

// Run a command (shell or plugin)
const runCommand = async function({
  event,
  childProcess,
  package,
  packageJson,
  local,
  buildCommand,
  configPath,
  buildDir,
  state,
  nodePath,
  childEnv,
  envChanges,
  errorMonitor,
  error,
  failure,
  failedPlugins,
  failFast,
}) {
  try {
    if (failedPlugins.includes(package)) {
      return { failure, failedPlugins }
    }

    const methodTimer = startTimer()

    state.index += 1
    const { index } = state
    logCommand({ event, package, index, configPath, error })

    const { newEnvChanges } = await fireCommand({
      event,
      childProcess,
      package,
      packageJson,
      local,
      buildCommand,
      configPath,
      buildDir,
      nodePath,
      childEnv,
      envChanges,
      error,
    })
    const nextEnvChanges = { ...envChanges, ...newEnvChanges }

    logCommandSuccess()

    const timerName = package === undefined ? 'build.command' : `${package} ${event}`
    endTimer(methodTimer, timerName)

    return { failure, failedPlugins, envChanges: nextEnvChanges }
  } catch (newFailure) {
    return handleCommandError({ newFailure, failedPlugins, failure, failFast, envChanges, errorMonitor })
  }
}

const fireCommand = function({
  event,
  childProcess,
  package,
  packageJson,
  local,
  buildCommand,
  configPath,
  buildDir,
  nodePath,
  childEnv,
  envChanges,
  error,
}) {
  if (buildCommand !== undefined) {
    return fireBuildCommand({ buildCommand, configPath, buildDir, nodePath, childEnv, envChanges })
  }

  return firePluginCommand({ event, childProcess, package, packageJson, local, envChanges, error })
}

// Fire `build.command`
const fireBuildCommand = async function({ buildCommand, configPath, buildDir, nodePath, childEnv, envChanges }) {
  logBuildCommandStart(buildCommand)

  const env = setEnvChanges(envChanges, { ...childEnv })
  const childProcess = execa(buildCommand, {
    shell: SHELL,
    cwd: buildDir,
    preferLocal: true,
    execPath: nodePath,
    env,
    extendEnv: false,
    stdio: 'inherit',
  })

  try {
    await childProcess
    return {}
  } catch (error) {
    addErrorInfo(error, { type: 'buildCommand', location: { buildCommand, configPath } })
    throw error
  }
}

// We use Bash on Unix and `cmd.exe` on Windows
const SHELL = platform === 'win32' ? true : 'bash'

// Fire a plugin command
const firePluginCommand = async function({ event, childProcess, package, packageJson, local, envChanges, error }) {
  pipeOutput(childProcess)

  try {
    const { newEnvChanges } = await callChild(
      childProcess,
      'run',
      { event, error, envChanges },
      { plugin: { packageJson, package }, location: { event, package, local } },
    )
    return { newEnvChanges }
  } finally {
    unpipeOutput(childProcess)
  }
}

// Handle shell or plugin error:
//  - usually (`failFast`), propagate the error to make the build stop.
//  - if onError and onEnd events (not `failFast`), wait until all event
//    handlers of the same type have been triggered before propagating
//  - if `utils.build.failPlugin()` was used, print an error and skip next event
//    handlers of that plugin. But do not stop build.
const handleCommandError = async function({ newFailure, failedPlugins, failure, failFast, envChanges, errorMonitor }) {
  const { type, location: { package } = {} } = getErrorInfo(newFailure)

  if (type === 'failPlugin') {
    logPluginError(newFailure)
    await reportBuildError(newFailure, errorMonitor)
    return { failure, failedPlugins: [...failedPlugins, package], envChanges }
  }

  if (failFast) {
    throw newFailure
  }

  return { failure: newFailure, failedPlugins, envChanges }
}

module.exports = { getCommands, isSuccessCommand, runCommands }
