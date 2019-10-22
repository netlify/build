const execa = require('execa')
const pMapSeries = require('p-map-series')
const pReduce = require('p-reduce')
const getStream = require('get-stream')
require('array-flat-polyfill')

const { executePlugin } = require('../plugins/ipc')
const { logInstruction, logCommandStart, logCommandError, logInstructionSuccess } = require('../log/main')
const { streamProcessOutput, writeProcessOutput, writeProcessError } = require('../log/stream')
const { startTimer, endTimer } = require('../log/timer')

const { LIFECYCLE } = require('./lifecycle')

// Get instructions for all hooks
const getInstructions = function({ pluginsHooks, config }) {
  const instructions = LIFECYCLE.flatMap(hook => getHookInstructions({ hook, pluginsHooks, config }))
  const buildInstructions = instructions.filter(({ hook }) => hook !== 'onError')
  const errorInstructions = instructions.filter(({ hook }) => hook === 'onError')
  return { buildInstructions, errorInstructions }
}

// Get instructions for a specific hook
const getHookInstructions = function({
  hook,
  pluginsHooks: { [hook]: pluginHooks = [] },
  config: {
    build: {
      lifecycle: { [hook]: commands },
    },
  },
}) {
  if (commands === undefined) {
    return pluginHooks
  }

  const lifeCycleHook = { id: `config.build.lifecycle.${hook}`, hook, commands, override: {} }
  return [lifeCycleHook, ...pluginHooks]
}

// Run a set of instructions
const runInstructions = async function(instructions, { config, configPath, token, baseDir, error }) {
  const manifest = await pReduce(
    instructions,
    (currentData, instruction, index) => {
      return runInstruction(instruction, {
        currentData,
        index,
        config,
        configPath,
        token,
        baseDir,
        error,
      })
    },
    {},
  )
  return manifest
}

// Run a single instruction
const runInstruction = async function(instruction, { currentData, index, config, configPath, token, baseDir, error }) {
  const { id, hook } = instruction

  const methodTimer = startTimer()

  logInstruction(instruction, { index, configPath, error })

  try {
    const pluginReturnValue = await fireMethod(instruction, { baseDir, config, token, error })

    logInstructionSuccess()

    endTimer(methodTimer, id, hook)

    return { ...currentData, ...pluginReturnValue }
  } catch (error) {
    error.message = `Error in '${id}' plugin:\n${error.message}`
    throw error
  }
}

const fireMethod = function(instruction, { baseDir, config, token, error }) {
  if (instruction.commands !== undefined) {
    return execCommands(instruction, { baseDir })
  }

  return firePluginHook(instruction, { config, token, baseDir, error })
}

// Fire a `config.lifecycle.*` series of commands
const execCommands = async function({ hook, commands }, { baseDir }) {
  await pMapSeries(commands, command => execCommand({ hook, command, baseDir }))
}

const execCommand = async function({ hook, command, baseDir }) {
  logCommandStart(command)

  const childProcess = execa(command, { shell: true, cwd: baseDir, preferLocal: true, all: true })
  const all = streamProcessOutput(childProcess)

  try {
    const [output] = await Promise.all([getStream(all), childProcess])
    writeProcessOutput(output)
  } catch (error) {
    writeProcessError(error)
    logCommandError(command, hook, error)
    throw error
  }
}

// Fire a plugin hook method
const firePluginHook = async function(
  { id, hook, pluginPath, pluginConfig, hookName, constants },
  { config, token, baseDir, error },
) {
  try {
    await executePlugin('run', { pluginPath, pluginConfig, hookName, config, token, error, constants }, { baseDir })
  } catch (error) {
    logCommandError(id, hook, error)
    throw error
  }
}

module.exports = { getInstructions, runInstructions }
