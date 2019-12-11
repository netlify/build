const execa = require('execa')
const pMapSeries = require('p-map-series')
const pReduce = require('p-reduce')
const { LIFECYCLE } = require('@netlify/config')

const { callChild } = require('../plugins/ipc')
const { logLifeCycleStart, logCommand, logShellCommandStart, logCommandSuccess } = require('../log/main')
const { startTimer, endTimer } = require('../log/timer')
const { startOutput, stopOutput } = require('../log/stream')

// Get commands for all events
const getCommands = function({ pluginsHooks, config }) {
  const commands = LIFECYCLE.flatMap(hook => getEventCommands({ hook, pluginsHooks, config }))

  const buildCommands = commands.filter(command => !isEndCommand(command) && !isErrorCommand(command))
  const endCommands = commands.filter(isEndCommand)
  const errorCommands = commands.filter(isErrorCommand)

  const mainCommands = [...buildCommands, ...endCommands]
  const commandsCount = mainCommands.length
  return { mainCommands, buildCommands, endCommands, errorCommands, commandsCount }
}

// Get commands for a specific event
const getEventCommands = function({
  hook,
  pluginsHooks: { [hook]: pluginCommands = [] },
  config: {
    build: {
      lifecycle: { [hook]: shellCommands },
    },
  },
}) {
  if (shellCommands === undefined) {
    return pluginCommands
  }

  const shellCommand = { id: `config.build.lifecycle.${hook}`, hook, shellCommands, override: {} }
  return [shellCommand, ...pluginCommands]
}

const isEndCommand = function({ hook }) {
  return hook === 'onEnd'
}

const isErrorCommand = function({ hook }) {
  return hook === 'onError'
}

// Run all commands.
// If an error arises, runs `onError` hooks.
// Runs `onEnd` hooks at the end, whether an error was thrown or not.
const runCommands = async function({ buildCommands, endCommands, errorCommands, commandsCount, configPath, baseDir }) {
  logLifeCycleStart(commandsCount)

  try {
    await execCommands(buildCommands, { configPath, baseDir, failFast: true })
  } catch (error) {
    await execCommands(errorCommands, { configPath, baseDir, failFast: false, error })
    throw error
  } finally {
    await execCommands(endCommands, { configPath, baseDir, failFast: false })
  }
}

// Run a set of commands.
// `onError` and `onEnd` do not `failFast`, i.e. if they fail, the other hooks
// of the same name keep running. However the failure is still eventually
// thrown. This allows users to be notified of issues inside their `onError` or
// `onEnd` hooks.
const execCommands = async function(commands, { configPath, baseDir, failFast, error }) {
  const { failure, manifest: manifestA } = await pReduce(
    commands,
    ({ failure, manifest }, command, index) =>
      runCommand(command, { manifest, index, configPath, baseDir, error, failure, failFast }),
    { manifest: {} },
  )

  if (failure !== undefined) {
    throw failure
  }

  return manifestA
}

// Run a command (shell or plugin)
const runCommand = async function(command, { manifest, index, configPath, baseDir, error, failure, failFast }) {
  try {
    const { id, hook } = command

    const methodTimer = startTimer()

    logCommand(command, { index, configPath, error })

    const pluginReturnValue = await fireCommand(command, { baseDir, error })

    logCommandSuccess()

    endTimer(methodTimer, id, hook)

    return { failure, manifest: { ...manifest, ...pluginReturnValue } }
  } catch (failure) {
    if (failFast) {
      throw failure
    }

    return { failure, manifest }
  }
}

const fireCommand = function(command, { baseDir, error }) {
  if (command.shellCommands !== undefined) {
    return fireShellCommands(command, { baseDir })
  }

  return firePluginCommand(command, { error })
}

// Fire a `config.lifecycle.*` series of shell commands
const fireShellCommands = async function({ hook, shellCommands }, { baseDir }) {
  await pMapSeries(shellCommands, shellCommand => fireShellCommand({ hook, shellCommand, baseDir }))
}

const fireShellCommand = async function({ hook, shellCommand, baseDir }) {
  logShellCommandStart(shellCommand)

  const childProcess = execa(shellCommand, { shell: true, cwd: baseDir, preferLocal: true })
  const chunks = []
  startOutput(childProcess, chunks)

  try {
    await childProcess
  } catch (error) {
    error.message = `In "${hook}" command "${shellCommand}":\n${error.message}`
    error.cleanStack = true
    throw error
  } finally {
    await stopOutput(childProcess, chunks)
  }
}

// Fire a plugin command
const firePluginCommand = async function({ id, childProcess, hook, hookName }, { error }) {
  const chunks = []
  startOutput(childProcess, chunks)

  try {
    await callChild(childProcess, 'run', { hookName, error })
  } catch (error) {
    error.message = `In "${hook}" command from "${id}":\n${error.message}`
    error.cleanStack = true
    throw error
  } finally {
    await stopOutput(childProcess, chunks)
  }
}

module.exports = { getCommands, runCommands }
