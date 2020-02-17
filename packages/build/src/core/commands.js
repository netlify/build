const execa = require('execa')
const pMapSeries = require('p-map-series')
const pReduce = require('p-reduce')
const { EVENTS } = require('@netlify/config')

const { callChild } = require('../plugins/ipc')
const { logCommandsStart, logCommand, logShellCommandStart, logCommandSuccess } = require('../log/main')
const { startTimer, endTimer } = require('../log/timer')
const { startOutput, stopOutput } = require('../log/stream')
const { getPluginErrorMessage } = require('../log/plugin_error')

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
      lifecycle: { [event]: shellCommands },
    },
  },
}) {
  if (shellCommands === undefined) {
    return pluginCommands
  }

  const shellCommand = { id: `config.build.lifecycle.${event}`, event, shellCommands, override: {} }
  return [shellCommand, ...pluginCommands]
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
  baseDir,
  childEnv,
}) {
  logCommandsStart(commandsCount)

  // We have to use a state variable to keep track of how many commands were run
  // before an error is thrown, so that error handlers are correctly numbered
  const state = { index: 0 }

  try {
    await execCommands(buildCommands, { configPath, baseDir, state, childEnv, failFast: true })
  } catch (error) {
    await execCommands(errorCommands, { configPath, baseDir, state, childEnv, failFast: false, error })
    throw error
  } finally {
    await execCommands(endCommands, { configPath, baseDir, state, childEnv, failFast: false })
  }
}

// Run a set of commands.
// `onError` and `onEnd` do not `failFast`, i.e. if they fail, the other events
// of the same name keep running. However the failure is still eventually
// thrown. This allows users to be notified of issues inside their `onError` or
// `onEnd` events.
const execCommands = async function(commands, { configPath, baseDir, state, childEnv, failFast, error }) {
  const { failure, manifest: manifestA } = await pReduce(
    commands,
    ({ failure, manifest }, command) =>
      runCommand(command, { manifest, configPath, baseDir, state, childEnv, error, failure, failFast }),
    { manifest: {} },
  )

  if (failure !== undefined) {
    throw failure
  }

  return manifestA
}

// Run a command (shell or plugin)
const runCommand = async function(
  command,
  { manifest, configPath, baseDir, state, childEnv, error, failure, failFast },
) {
  try {
    const { id, event } = command

    const methodTimer = startTimer()

    state.index += 1
    const { index } = state
    logCommand(command, { index, configPath, error })

    const pluginReturnValue = await fireCommand(command, { baseDir, childEnv, error })

    logCommandSuccess()

    endTimer(methodTimer, id, event)

    return { failure, manifest: { ...manifest, ...pluginReturnValue } }
  } catch (failure) {
    if (failFast) {
      throw failure
    }

    return { failure, manifest }
  }
}

const fireCommand = function(command, { baseDir, childEnv, error }) {
  if (command.shellCommands !== undefined) {
    return fireShellCommands(command, { baseDir, childEnv })
  }

  return firePluginCommand(command, { error })
}

// Fire a `config.lifecycle.*` series of shell commands
const fireShellCommands = async function({ event, shellCommands }, { baseDir, childEnv }) {
  await pMapSeries(shellCommands, shellCommand => fireShellCommand({ event, shellCommand, baseDir, childEnv }))
}

const fireShellCommand = async function({ event, shellCommand, baseDir, childEnv }) {
  logShellCommandStart(shellCommand)

  const childProcess = execa(shellCommand, {
    shell: true,
    cwd: baseDir,
    preferLocal: true,
    env: childEnv,
    extendEnv: false,
  })
  const chunks = []
  startOutput(childProcess, chunks)

  try {
    await childProcess
  } catch (error) {
    error.message = `In "${event}" command "${shellCommand}":\n${error.message}`
    error.cleanStack = true
    throw error
  } finally {
    await stopOutput(childProcess, chunks)
  }
}

// Fire a plugin command
const firePluginCommand = async function(
  { id, childProcess, event, originalEvent, package, packageJson, local },
  { error },
) {
  const chunks = []
  startOutput(childProcess, chunks)

  try {
    await callChild(childProcess, 'run', { originalEvent, error })
  } catch (error) {
    error.message = getPluginErrorMessage({ error, id, event, package, packageJson, local })
    error.cleanStack = true
    throw error
  } finally {
    await stopOutput(childProcess, chunks)
  }
}

module.exports = { getCommands, runCommands }
