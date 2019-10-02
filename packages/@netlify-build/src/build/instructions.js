const path = require('path')

require('./colors')
const chalk = require('chalk')
const execa = require('execa')
const pMapSeries = require('p-map-series')
const pReduce = require('p-reduce')
require('array-flat-polyfill')

const { redactStream } = require('../utils/redact')
const netlifyLogs = require('../utils/patch-logs')
const { startTimer, endTimer } = require('../utils/timer')

const { LIFECYCLE } = require('./lifecycle')
const { getApiClient } = require('./api')

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
  console.log(chalk.yellowBright(`Running command "${cmd}"`))
  const subprocess = execa(`${cmd}`, { shell: true })
  subprocess.stdout
    // Redact ENV vars
    .pipe(redactStream(secrets))
    // Output to console
    .pipe(
      process.stdout,
      { end: true }
    )
  try {
    const { stdout } = await subprocess
    return stdout
  } catch (err) {
    console.log(chalk.redBright(`Error from netlify config ${name}:`))
    console.log(`"${cmd}"`)
    console.log()
    console.log(chalk.redBright('Error message\n'))
    console.log(err.stderr)
    console.log()
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
    console.log()
    endTimer({ context: name.replace('config.', ''), hook }, methodTimer)
    netlifyLogs.reset()
    return Object.assign({}, currentData, pluginReturnValue)
  } catch (error) {
    console.log(chalk.redBright(`Error in ${name} plugin`))
    netlifyLogs.reset()
    throw error
  }
}

const logInstruction = function({
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
}) {
  console.log()
  if (override.hook) {
    console.log(
      chalk.redBright.bold(`> OVERRIDE: "${override.hook}" method in ${override.name} has been overriden by "${name}"`)
    )
  }
  const lifecycleName = error ? '' : 'lifecycle '
  const source = name.startsWith('config.build') ? `in ${path.basename(netlifyConfigPath)} config file` : 'plugin'
  const niceName = name.startsWith('config.build') ? name.replace(/^config\./, '') : name
  const logColor = error ? chalk.redBright : chalk.cyanBright
  const outputNoChalk = `${index + 1}. Running ${hook} ${lifecycleName}from ${niceName} ${source}`
  const output = `${index + 1}. Running ${chalk.white.bold(hook)} ${lifecycleName}from ${chalk.white.bold(
    niceName
  )} ${source}`
  const line = '─'.repeat(outputNoChalk.length + 2)
  console.log(logColor.bold(`┌─${line}─┐`))
  console.log(logColor.bold(`│ ${output}   │`))
  console.log(logColor.bold(`└─${line}─┘`))
  console.log()
}

module.exports = { getInstructions, runInstructions }
