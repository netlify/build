const execa = require('execa')
const pReduce = require('p-reduce')
const { EVENTS } = require('@netlify/config')

const { callChild } = require('../plugins/ipc')
const { logCommandsStart, logCommand, logShellCommandStart, logCommandSuccess, logPluginError } = require('../log/main')
const { startTimer, endTimer } = require('../log/timer')
const { startOutput, stopOutput } = require('../log/stream')
const { addErrorInfo, getErrorInfo } = require('../error/info')

// Get commands for all events
const getCommands = function({ pluginsCommands, netlifyConfig }) {
  const commands = EVENTS.flatMap(event => getEventCommands({ event, pluginsCommands, netlifyConfig }))

  const buildCommands = commands.filter(command => !isEndCommand(command) && !isErrorCommand(command))
  const endCommands = commands.filter(isEndCommand)
  const errorCommands = commands.filter(isErrorCommand)

  const mainCommands = [...buildCommands, ...endCommands]
  const commandsCount = mainCommands.length
  return { mainCommands, buildCommands, endCommands, errorCommands, commandsCount }
}

// Get commands for a specific event
const getEventCommands = function({
  event,
  pluginsCommands: { [event]: pluginCommands = [] },
  netlifyConfig: {
    build: {
      lifecycle: { [event]: shellCommand },
    },
  },
}) {
  if (shellCommand === undefined) {
    return pluginCommands
  }

  const shellCommandA = { prop: `build.lifecycle.${event}`, event, shellCommand }
  return [shellCommandA, ...pluginCommands]
}

const isEndCommand = function({ event }) {
  return event === 'onEnd'
}

const isErrorCommand = function({ event }) {
  return event === 'onError'
}

// Run all commands.
// If an error arises, runs `onError` events.
// Runs `onEnd` events at the end, whether an error was thrown or not.
const runCommands = async function({
  buildCommands,
  endCommands,
  errorCommands,
  commandsCount,
  configPath,
  buildDir,
  nodePath,
  childEnv,
}) {
  logCommandsStart(commandsCount)

  // We have to use a state variable to keep track of how many commands were run
  // before an error is thrown, so that error handlers are correctly numbered
  const state = { index: 0 }

  try {
    await execCommands(buildCommands, { configPath, buildDir, state, nodePath, childEnv, failFast: true })
  } catch (error) {
    await execCommands(errorCommands, { configPath, buildDir, state, nodePath, childEnv, failFast: false, error })
    throw error
  } finally {
    await execCommands(endCommands, { configPath, buildDir, state, nodePath, childEnv, failFast: false })
  }
}

// Run a set of commands.
// `onError` and `onEnd` do not `failFast`, i.e. if they fail, the other events
// of the same name keep running. However the failure is still eventually
// thrown. This allows users to be notified of issues inside their `onError` or
// `onEnd` events.
const execCommands = async function(commands, { configPath, buildDir, state, nodePath, childEnv, failFast, error }) {
  const { failure } = await pReduce(
    commands,
    ({ failure, failedPlugins }, command) =>
      runCommand(command, { configPath, buildDir, state, nodePath, childEnv, error, failure, failedPlugins, failFast }),
    { failedPlugins: [] },
  )

  if (failure !== undefined) {
    throw failure
  }
}

// Run a command (shell or plugin)
const runCommand = async function(
  command,
  { configPath, buildDir, state, nodePath, childEnv, error, failure, failedPlugins, failFast },
) {
  try {
    const { event, prop, package } = command

    if (failedPlugins.includes(package)) {
      return { failure, failedPlugins }
    }

    const methodTimer = startTimer()

    state.index += 1
    const { index } = state
    logCommand(command, { index, configPath, error })

    await fireCommand(command, { buildDir, nodePath, childEnv, error })

    logCommandSuccess()

    const timerName = prop === undefined ? `${package} ${event}` : prop
    endTimer(methodTimer, timerName)

    return { failure, failedPlugins }
  } catch (newFailure) {
    return handleCommandError({ newFailure, failedPlugins, failure, failFast })
  }
}

const fireCommand = function(command, { buildDir, nodePath, childEnv, error }) {
  if (command.shellCommand !== undefined) {
    return fireShellCommand(command, { buildDir, nodePath, childEnv })
  }

  return firePluginCommand(command, { error })
}

// Fire a `config.lifecycle.*` shell command
const fireShellCommand = async function({ prop, shellCommand }, { buildDir, nodePath, childEnv }) {
  logShellCommandStart(shellCommand)

  const childProcess = execa(shellCommand, {
    shell: true,
    cwd: buildDir,
    preferLocal: true,
    execPath: nodePath,
    env: childEnv,
    extendEnv: false,
  })
  const outputState = startOutput(childProcess)

  try {
    await childProcess
  } catch (error) {
    addErrorInfo(error, { type: 'shellCommand', location: { prop, shellCommand } })
    throw error
  } finally {
    await stopOutput(childProcess, outputState)
  }
}

// Fire a plugin command
const firePluginCommand = async function({ childProcess, event, package, packageJson, local }, { error }) {
  const outputState = startOutput(childProcess)

  try {
    await callChild(childProcess, 'run', { event, error })
  } catch (error) {
    addErrorInfo(error, { plugin: { packageJson, package }, location: { event, package, local } })
    throw error
  } finally {
    await stopOutput(childProcess, outputState)
  }
}

// Handle shell or plugin error:
//  - usually (`failFast`), propagate the error to make the build stop.
//  - if onError and onEnd events (not `failFast`), wait until all event
//    handlers of the same type have been triggered before propagating
//  - if `utils.build.failPlugin()` was used, print an error and skip next event
//    handlers of that plugin. But do not stop build.
const handleCommandError = function({ newFailure, failedPlugins, failure, failFast }) {
  const { type, location: { package } = {} } = getErrorInfo(newFailure)

  if (type === 'failPlugin') {
    logPluginError(newFailure)
    return { failure, failedPlugins: [...failedPlugins, package] }
  }

  if (failFast) {
    throw newFailure
  }

  return { failure: newFailure, failedPlugins }
}

module.exports = { getCommands, runCommands }
