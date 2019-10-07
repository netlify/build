const execa = require('execa')
const pMapSeries = require('p-map-series')
const pReduce = require('p-reduce')
require('array-flat-polyfill')

const { sendEventToChild, getEventFromChild } = require('../plugins/ipc')
const { logInstruction, logCommandStart, logCommandError, logInstructionSuccess } = require('../log/main')
const { setLogContext, unsetLogContext } = require('../log/patch')
const { redactProcess } = require('../log/patch')
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
      lifecycle: { [hook]: commands }
    }
  }
}) {
  if (commands === undefined) {
    return pluginHooks
  }

  const lifeCycleHook = { name: `config.build.lifecycle.${hook}`, hook, commands, override: {} }
  return [lifeCycleHook, ...pluginHooks]
}

// Run a set of instructions
const runInstructions = async function(instructions, { childProcesses, configPath, baseDir, redactedKeys, error }) {
  return await pReduce(
    instructions,
    (currentData, instruction, index) =>
      runInstruction(instruction, { currentData, index, childProcesses, configPath, baseDir, redactedKeys, error }),
    {}
  )
}

// Run a single instruction
const runInstruction = async function(
  instruction,
  { currentData, index, childProcesses, configPath, baseDir, redactedKeys, error }
) {
  const { name, hook } = instruction

  const methodTimer = startTimer()

  logInstruction(instruction, { index, configPath, error })

  setLogContext(name)

  try {
    const pluginReturnValue = await fireMethod(instruction, { childProcesses, baseDir, redactedKeys, error })

    logInstructionSuccess()
    unsetLogContext()

    endTimer(methodTimer, name, hook)

    return Object.assign({}, currentData, pluginReturnValue)
  } catch (error) {
    unsetLogContext()

    error.message = `Error in '${name}' plugin:\n${error.message}`
    throw error
  }
}

const fireMethod = function(instruction, { childProcesses, baseDir, redactedKeys, error }) {
  if (instruction.commands !== undefined) {
    return execCommands(instruction, { baseDir, redactedKeys })
  }

  return firePluginHook(instruction, { childProcesses, error })
}

// Fire a `config.lifecycle.*` series of commands
const execCommands = async function({ hook, commands }, { baseDir, redactedKeys }) {
  await pMapSeries(commands, command => execCommand({ hook, command, baseDir, redactedKeys }))
}

const execCommand = async function({ hook, command, baseDir, redactedKeys }) {
  logCommandStart(command)

  try {
    const childProcess = execa(String(command), { shell: true, cwd: baseDir })
    redactProcess(childProcess, redactedKeys)
    const { stdout } = await childProcess
    return stdout
  } catch (error) {
    logCommandError(command, hook, error)
    process.exit(1)
  }
}

// Fire a plugin hook method
const firePluginHook = async function({ hookName, name }, { childProcesses, error }) {
  const childProcess = childProcesses[name]
  await sendEventToChild(childProcess, 'run', { hookName, error })
  await getEventFromChild(childProcess, 'run')
}

module.exports = { getInstructions, runInstructions }
