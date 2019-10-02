const path = require('path')

require('./colors')
const execa = require('execa')
const pMapSeries = require('p-map-series')
const pReduce = require('p-reduce')
require('array-flat-polyfill')

const { redactStream } = require('../utils/redact')
const netlifyLogs = require('../utils/patch-logs')
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
const getInstructions = function({ pluginsHooks, netlifyConfig, redactedKeys }) {
  const instructions = LIFECYCLE.flatMap(hook =>
    getHookInstructions({ hook, pluginsHooks, netlifyConfig, redactedKeys })
  )
  const buildInstructions = instructions.filter(({ hook }) => hook !== 'onError')
  const errorInstructions = instructions.filter(({ hook }) => hook === 'onError')
  return { buildInstructions, errorInstructions }
}

// Get instructions for a specific hook
const getHookInstructions = function({
  hook,
  pluginsHooks,
  netlifyConfig: {
    build: { command: configCommand, lifecycle: configLifecycle }
  },
  redactedKeys
}) {
  return [
    // Support for old command. Add build.command to execution
    configCommand && hook === 'build'
      ? {
          name: `config.build.command`,
          hook: 'build',
          pluginConfig: {},
          async method() {
            await execCommand(configCommand, 'build.command', redactedKeys)
          },
          override: {}
        }
      : undefined,
    // Merge in config lifecycle events first
    configLifecycle && configLifecycle[hook]
      ? {
          name: `config.build.lifecycle.${hook}`,
          hook,
          pluginConfig: {},
          async method() {
            const commands = Array.isArray(configLifecycle[hook])
              ? configLifecycle[hook]
              : configLifecycle[hook].split('\n')
            // TODO pass in env vars if not available
            // TODO return stdout?
            await pMapSeries(commands, command => execCommand(command, `build.lifecycle.${hook}`, redactedKeys))
          },
          override: {}
        }
      : undefined,
    ...(pluginsHooks[hook] ? pluginsHooks[hook] : [])
  ].filter(Boolean)
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
const runInstructions = async function(
  instructions,
  { netlifyConfig, netlifyConfigPath, netlifyToken, baseDir, error }
) {
  return await pReduce(
    instructions,
    (currentData, instruction, index) =>
      runInstruction({
        currentData,
        instruction,
        index,
        netlifyConfig,
        netlifyConfigPath,
        netlifyToken,
        baseDir,
        error
      }),
    {}
  )
}

// Run a single instruction
const runInstruction = async function({
  currentData,
  instruction: { method, hook, pluginConfig, name, override, meta: { scopes } = {} },
  index,
  netlifyConfig,
  netlifyConfigPath,
  netlifyToken,
  baseDir,
  error
}) {
  const methodTimer = startTimer()

  logInstruction({
    currentData,
    method,
    hook,
    pluginConfig,
    name,
    override,
    scopes,
    index,
    netlifyConfig,
    netlifyConfigPath,
    netlifyToken,
    baseDir,
    error
  })

  const api = getApiClient({ netlifyToken, name, scopes })

  netlifyLogs.setContext(name)

  try {
    // https://github.com/netlify/cli-utils/blob/master/src/index.js#L40-L60
    const pluginReturnValue = await method({
      /* Netlify configuration file netlify.[toml|yml|json] */
      netlifyConfig,
      /* Plugin configuration */
      pluginConfig,
      /* Netlify API client */
      api,
      /* Values constants */
      constants: {
        CONFIG_PATH: path.resolve(netlifyConfigPath),
        BASE_DIR: baseDir,
        CACHE_DIR: path.join(baseDir, '.netlify', 'cache'),
        BUILD_DIR: path.join(baseDir, '.netlify', 'build')
      },
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
      /* Error for `onError` handlers */
      error
    })

    logInstructionSuccess()
    netlifyLogs.reset()

    endTimer({ context: name.replace('config.', ''), hook }, methodTimer)

    return Object.assign({}, currentData, pluginReturnValue)
  } catch (error) {
    logInstructionError(name)
    netlifyLogs.reset()

    throw error
  }
}

module.exports = { getInstructions, runInstructions }
