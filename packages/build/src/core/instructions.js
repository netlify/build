const path = require('path')

const execa = require('execa')
const pMapSeries = require('p-map-series')
const pReduce = require('p-reduce')
require('array-flat-polyfill')

const { logInstruction, logCommandStart, logCommandError, logInstructionSuccess } = require('../log/main')
const { setLogContext, unsetLogContext } = require('../log/patch')
const { redactStream } = require('../log/patch')
const { startTimer, endTimer } = require('../log/timer')

const { LIFECYCLE } = require('./lifecycle')
const { getApiClient } = require('./api')

// Get instructions for all hooks
const getInstructions = function({ pluginsHooks, config, redactedKeys }) {
  const instructions = LIFECYCLE.flatMap(hook => getHookInstructions({ hook, pluginsHooks, config, redactedKeys }))
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
      lifecycle: { [hook]: lifecycleCommands }
    }
  },
  redactedKeys
}) {
  if (lifecycleCommands === undefined) {
    return pluginHooks
  }

  const lifeCycleHook = {
    name: `config.build.lifecycle.${hook}`,
    hook,
    async method() {
      await pMapSeries(lifecycleCommands, command => execCommand(command, `build.lifecycle.${hook}`, redactedKeys))
    },
    meta: {},
    override: {},
    pluginConfig: {}
  }
  return [lifeCycleHook, ...pluginHooks]
}

const execCommand = async function(cmd, name, secrets) {
  logCommandStart(cmd)

  try {
    const subprocess = execa(String(cmd), { shell: true })
    subprocess.stdout.pipe(redactStream(secrets)).pipe(process.stdout)
    subprocess.stderr.pipe(redactStream(secrets)).pipe(process.stderr)
    const { stdout } = await subprocess
    return stdout
  } catch (error) {
    logCommandError(cmd, name, error)
    process.exit(1)
  }
}

// Run a set of instructions
const runInstructions = async function(instructions, { config, configPath, token, baseDir, error }) {
  return await pReduce(
    instructions,
    (currentData, instruction, index) =>
      runInstruction({ currentData, instruction, index, config, configPath, token, baseDir, error }),
    {}
  )
}

// Run a single instruction
const runInstruction = async function({
  currentData,
  instruction: { method, hook, pluginConfig, name, override, meta: { scopes } = {} },
  index,
  config,
  configPath,
  token,
  baseDir,
  error
}) {
  const methodTimer = startTimer()

  logInstruction({ hook, name, override, index, configPath, error })

  const api = getApiClient({ token, name, scopes })
  const constants = getConstants(configPath, baseDir)

  setLogContext(name)

  try {
    const pluginReturnValue = await method({
      config,
      pluginConfig,
      api,
      constants,
      /* Utilities helper functions */
      utils: {
        cache: {
          get: filePath => {
            console.log('get cache file')
          },
          save: (filePath, contents) => {
            console.log('save cache file')
          },
          delete: filePath => {
            console.log('delete cache file')
          }
        },
        redirects: {
          get: () => {
            console.log('get redirect')
          },
          set: () => {
            console.log('set redirect')
          },
          delete: () => {
            console.log('delete redirect')
          }
        }
      },
      error
    })

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

const getConstants = function(configPath, baseDir) {
  return {
    CONFIG_PATH: path.resolve(configPath),
    BASE_DIR: baseDir,
    CACHE_DIR: path.join(baseDir, '.netlify', 'cache'),
    BUILD_DIR: path.join(baseDir, '.netlify', 'build')
  }
}

module.exports = { getInstructions, runInstructions }
