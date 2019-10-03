const path = require('path')

require('./colors')
const execa = require('execa')
const pMapSeries = require('p-map-series')
const pReduce = require('p-reduce')
require('array-flat-polyfill')

const { redactStream } = require('../utils/redact')
const { setLogContext, unsetLogContext } = require('../utils/patch-logs')
const { startTimer, endTimer } = require('../utils/timer')

const { LIFECYCLE } = require('./lifecycle')
const { getApiClient } = require('./api')
const {
  logInstruction,
  logCommandStart,
  logCommandError,
  logInstructionSuccess,
  logInstructionError
} = require('./log')

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
    pluginConfig: {},
    async method() {
      await pMapSeries(lifecycleCommands, command => execCommand(command, `build.lifecycle.${hook}`, redactedKeys))
    },
    override: {}
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

    endTimer({ context: name.replace('config.', ''), hook }, methodTimer)

    return Object.assign({}, currentData, pluginReturnValue)
  } catch (error) {
    logInstructionError(name)
    unsetLogContext()

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
