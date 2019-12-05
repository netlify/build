const execa = require('execa')
const pMapSeries = require('p-map-series')
const pReduce = require('p-reduce')
const { LIFECYCLE } = require('@netlify/config')

const { callChild } = require('../plugins/ipc')
const { logLifeCycleStart, logInstruction, logCommandStart, logInstructionSuccess } = require('../log/main')
const { startTimer, endTimer } = require('../log/timer')
const { startOutput, stopOutput } = require('../log/stream')

// Get instructions for all hooks
const getInstructions = function({ pluginsHooks, config }) {
  const instructions = LIFECYCLE.flatMap(hook => getHookInstructions({ hook, pluginsHooks, config }))

  const buildInstructions = instructions.filter(
    instruction => !isEndInstruction(instruction) && !isErrorInstruction(instruction),
  )
  const endInstructions = instructions.filter(isEndInstruction)
  const errorInstructions = instructions.filter(isErrorInstruction)

  const mainInstructions = [...buildInstructions, ...endInstructions]
  const instructionsCount = mainInstructions.length
  return { mainInstructions, buildInstructions, endInstructions, errorInstructions, instructionsCount }
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

const isEndInstruction = function({ hook }) {
  return hook === 'onEnd'
}

const isErrorInstruction = function({ hook }) {
  return hook === 'onError'
}

// Run all instructions.
// If an error arises, runs `onError` hooks.
// Runs `onEnd` hooks at the end, whether an error was thrown or not.
const runInstructions = async function({
  buildInstructions,
  endInstructions,
  errorInstructions,
  instructionsCount,
  configPath,
  baseDir,
}) {
  logLifeCycleStart(instructionsCount)

  try {
    await execInstructions(buildInstructions, { configPath, baseDir, failFast: true })
  } catch (error) {
    await execInstructions(errorInstructions, { configPath, baseDir, failFast: false, error })
    throw error
  } finally {
    await execInstructions(endInstructions, { configPath, baseDir, failFast: false })
  }
}

// Run a set of instructions.
// `onError` and `onEnd` do not `failFast`, i.e. if they fail, the other hooks
// of the same name keep running. However the failure is still eventually
// thrown. This allows users to be notified of issues inside their `onError` or
// `onEnd` hooks.
const execInstructions = async function(instructions, { configPath, baseDir, failFast, error }) {
  const { failure, manifest: manifestA } = await pReduce(
    instructions,
    ({ failure, manifest }, instruction, index) =>
      runInstruction(instruction, { manifest, index, configPath, baseDir, error, failure, failFast }),
    { manifest: {} },
  )

  if (failure !== undefined) {
    throw failure
  }

  return manifestA
}

// Run a single instruction
const runInstruction = async function(instruction, { manifest, index, configPath, baseDir, error, failure, failFast }) {
  try {
    const { id, hook } = instruction

    const methodTimer = startTimer()

    logInstruction(instruction, { index, configPath, error })

    const pluginReturnValue = await fireMethod(instruction, { baseDir, error })

    logInstructionSuccess()

    endTimer(methodTimer, id, hook)

    return { failure, manifest: { ...manifest, ...pluginReturnValue } }
  } catch (failure) {
    if (failFast) {
      throw failure
    }

    return { failure, manifest }
  }
}

const fireMethod = function(instruction, { baseDir, error }) {
  if (instruction.commands !== undefined) {
    return execCommands(instruction, { baseDir })
  }

  return firePluginHook(instruction, { error })
}

// Fire a `config.lifecycle.*` series of commands
const execCommands = async function({ hook, commands }, { baseDir }) {
  await pMapSeries(commands, command => execCommand({ hook, command, baseDir }))
}

const execCommand = async function({ hook, command, baseDir }) {
  logCommandStart(command)

  const childProcess = execa(command, { shell: true, cwd: baseDir, preferLocal: true })
  const chunks = []
  startOutput(childProcess, chunks)

  try {
    await childProcess
  } catch (error) {
    error.message = `In "${hook}" command "${command}":\n${error.message}`
    error.cleanStack = true
    throw error
  } finally {
    await stopOutput(childProcess, chunks)
  }
}

// Fire a plugin hook method
const firePluginHook = async function({ id, childProcess, hook, hookName }, { error }) {
  const chunks = []
  startOutput(childProcess, chunks)

  try {
    await callChild(childProcess, 'run', { hookName, error })
  } catch (error) {
    error.message = `In "${hook}" step from "${id}":\n${error.message}`
    error.cleanStack = true
    throw error
  } finally {
    await stopOutput(childProcess, chunks)
  }
}

module.exports = { getInstructions, runInstructions }
