const { basename } = require('path')
const {
  env: { ERROR_VERBOSE }
} = require('process')

const { tick, pointer } = require('figures')
const omit = require('omit.js')

const { patchLogs } = require('./patch')
const { getSecrets } = require('./redact')
const { serialize } = require('./serialize')
const { setColorLevel } = require('./colors')
const { cleanStack } = require('./stack')

setColorLevel()
// eslint-disable-next-line import/order
const { greenBright, cyanBright, redBright, yellowBright, bold } = require('chalk')

// Monkey patch console.log() to redact secrets
const startPatchingLog = function() {
  const redactedKeys = getSecrets(SECRETS)
  const originalConsoleLog = console.log
  console.log = patchLogs(redactedKeys)
  return { redactedKeys, originalConsoleLog }
}

const SECRETS = ['SECRET_ENV_VAR', 'MY_API_KEY']

const stopPatchingLog = function(originalConsoleLog) {
  console.log = originalConsoleLog
}

const HEADING_PREFIX = pointer

const logBuildStart = function() {
  console.log(greenBright.bold(`${HEADING_PREFIX} Starting Netlify Build`))
  console.log(`https://github.com/netlify/build`)
  console.log()
}

const logOptions = function(options) {
  console.log(cyanBright.bold('Options'))
  console.log(serialize(omit(options, ['token'])))
  console.log()
}

const logConfigPath = function(configPath) {
  console.log(cyanBright.bold(`${HEADING_PREFIX} Using config file: ${configPath}`))
  console.log()
}

const logLoadPlugins = function() {
  console.log(cyanBright.bold(`${HEADING_PREFIX} Loading plugins`))
}

const logLoadPlugin = function(name) {
  console.log(yellowBright(`Loading plugin "${name}"`))
}

const logLifeCycleStart = function() {
  console.log()
  console.log(greenBright.bold('Running Netlify Build Lifecycle'))
  console.log()
}

const logDryRunStart = function() {
  console.log()
  console.log(cyanBright.bold(`${HEADING_PREFIX} Netlify Build Steps`))
  console.log()
}

const logDryRunInstruction = function({ instruction: { name, hook }, index, configPath, width }) {
  const source = name.startsWith('config.build') ? `in ${basename(configPath)}` : 'plugin'
  const count = cyanBright(`${index + 1}.`)
  const hookName = bold(`${hook.padEnd(width + 2)} `)
  const niceName = name.startsWith('config.build') ? name.replace('config.', '') : name
  const sourceOutput = bold(niceName)
  console.log(cyanBright(`${count} ${hookName} source ${sourceOutput} ${source} `))
}

const logDryRunEnd = function() {
  console.log()
}

const logInstruction = function({ hook, name, override, index, configPath, error }) {
  console.log()
  if (override.hook) {
    console.log(
      redBright.bold(`> OVERRIDE: "${override.hook}" method in ${override.name} has been overriden by "${name}"`)
    )
  }
  const lifecycleName = error ? '' : 'lifecycle '
  const source = name.startsWith('config.build') ? `in ${basename(configPath)} config file` : 'plugin'
  const niceName = name.startsWith('config.build') ? name.replace(/^config\./, '') : name
  const logColor = error ? redBright : cyanBright
  const outputNoChalk = `${index + 1}. Running ${hook} ${lifecycleName}from ${niceName} ${source}`
  const output = `${index + 1}. Running ${bold(hook)} ${lifecycleName}from ${bold(niceName)} ${source}`
  const line = '─'.repeat(outputNoChalk.length + 2)
  console.log(logColor.bold(`┌─${line}─┐`))
  console.log(logColor.bold(`│ ${output}   │`))
  console.log(logColor.bold(`└─${line}─┘`))
  console.log()
}

const logCommandStart = function(cmd) {
  console.log(yellowBright(`Running command "${cmd}"`))
}

const logCommandError = function(cmd, name, error) {
  console.log(redBright(`Error from netlify config ${name}:`))
  console.log(`"${cmd}"`)
  console.log()
  console.log(redBright('Error message\n'))
  console.log(error.stderr)
  console.log()
}

const logInstructionSuccess = function() {
  console.log()
}

const logTimer = function(durationMs, hook, context) {
  const hookA = hook ? `.${bold(hook)}` : ''
  const contextA = context.replace('config.', '')
  const contextB = contextA.startsWith('build.lifecycle') ? 'build.lifecycle' : contextA

  console.info(` ${greenBright(tick)}  ${greenBright.bold(contextB)}${hookA} completed in ${durationMs}ms`)
}

const logManifest = function(manifest) {
  if (Object.keys(manifest).length === 0) {
    return
  }

  console.log('Manifest:')
  console.log(serialize(manifest))
}

const logTomlWrite = function(tomlPath, toml) {
  console.log()
  console.log('TOML output:')
  console.log()
  console.log(toml)
  console.log(`TOML file written to ${tomlPath}`)
}

const logInstructionsError = function() {
  console.log()
  console.log(redBright.bold('┌─────────────────────┐'))
  console.log(redBright.bold('│  Lifecycle Error!   │'))
  console.log(redBright.bold('└─────────────────────┘'))
}

const logErrorInstructions = function() {
  console.log()
  console.log(cyanBright('Running onError methods'))
}

const logBuildError = function(error) {
  console.log()
  console.log(redBright.bold('┌─────────────────────────────┐'))
  console.log(redBright.bold('│    Netlify Build Error!     │'))
  console.log(redBright.bold('└─────────────────────────────┘'))
  console.log(bold(` ${error.message}`))
  console.log()
  console.log(yellowBright.bold('┌─────────────────────────────┐'))
  console.log(yellowBright.bold('│      Error Stack Trace      │'))
  console.log(yellowBright.bold('└─────────────────────────────┘'))

  if (ERROR_VERBOSE === 'true') {
    console.log(error.stack)
  } else {
    console.log(` ${bold(cleanStack(error.stack))}`)
    console.log()
    console.log(` Set environment variable ERROR_VERBOSE=true for deep traces`)
  }

  console.log()
}

const logBuildSuccess = function() {
  console.log()
  console.log(greenBright.bold('┌─────────────────────────────┐'))
  console.log(greenBright.bold('│   Netlify Build Complete!   │'))
  console.log(greenBright.bold('└─────────────────────────────┘'))
  console.log()
}

const logBuildEnd = function() {
  const sparkles = cyanBright('(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧')
  console.log(`\n${sparkles} Have a nice day!\n`)
}

module.exports = {
  startPatchingLog,
  stopPatchingLog,
  logBuildStart,
  logOptions,
  logConfigPath,
  logLoadPlugins,
  logLoadPlugin,
  logLifeCycleStart,
  logDryRunStart,
  logDryRunInstruction,
  logDryRunEnd,
  logInstruction,
  logCommandStart,
  logCommandError,
  logInstructionSuccess,
  logTimer,
  logManifest,
  logTomlWrite,
  logInstructionsError,
  logErrorInstructions,
  logBuildError,
  logBuildSuccess,
  logBuildEnd
}
