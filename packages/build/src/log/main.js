const { basename } = require('path')

const { tick, pointer, arrowDown } = require('figures')
const omit = require('omit.js')

const telemetry = require('../utils/telemetry')

const { log } = require('./patch')
const { cleanStack } = require('./stack')

// eslint-disable-next-line import/order
const { greenBright, cyanBright, redBright, yellowBright, bold, white } = require('chalk')

const HEADING_PREFIX = pointer
const SUBTEXT_PADDING = '  '

const logBuildStart = function() {
  log(greenBright.bold(`${HEADING_PREFIX} Starting Netlify Build`))
  log(`${SUBTEXT_PADDING}https://github.com/netlify/build`)
  log()
}

const logOptions = function(options) {
  const opts = omit(options, ['token', 'dry'])
  if (Object.keys(opts).length) {
    log(cyanBright.bold('Options'))
    log(' ', opts)
    log()
  }
}

const logConfigPath = function(configPath) {
  log(cyanBright.bold(`${HEADING_PREFIX} Using config file:`))
  log(`${SUBTEXT_PADDING}${configPath}`)
  log()
}

const logInstallPlugins = function() {
  log(cyanBright.bold(`${HEADING_PREFIX} Installing plugins dependencies`))
}

const logLoadPlugins = function() {
  log()
  log(cyanBright.bold(`${HEADING_PREFIX} Loading plugins`))
}

const logLoadPlugin = function(pluginId, type, core) {
  const location = core ? 'build core' : type
  log(yellowBright(`${SUBTEXT_PADDING}Loading plugin "${pluginId}" from ${location}`))
}

const logLifeCycleStart = function(instructions) {
  log()
  log(greenBright.bold(`${HEADING_PREFIX} Running Netlify Build Lifecycle`))
  const stepsWord = instructions.length === 1 ? 'step' : `steps`
  log(`${SUBTEXT_PADDING}Found ${instructions.length} ${stepsWord}. Lets do this!`)
}

const logDryRunStart = function() {
  log()
  log(cyanBright.bold(`${HEADING_PREFIX} Netlify Build Steps`))
  log(`${SUBTEXT_PADDING}For more information on build lifecycles see the docs https://github.com/netlify/build`)
  log()
  log(`${SUBTEXT_PADDING}Running \`netlify build\` will execute this build flow`)
  log()
}

const logDryRunInstruction = function({
  instruction: { name, hook, type, core },
  index,
  configPath,
  width,
  buildInstructions
}) {
  const countText = `${index + 1}.`
  const count = cyanBright(countText)
  const boxOffset = buildInstructions.length.toString().length + 4
  const textOffset = countText.length + 3
  const boxWidth = width + boxOffset
  const line = '─'.repeat(boxWidth)
  const secondLine = '─'.repeat(boxWidth + 5)
  if (index === 0) {
    log(bold(`${SUBTEXT_PADDING}┌─${line}─┬─${secondLine}─`))
    log(bold(`${SUBTEXT_PADDING}│ ${'Lifecycle Hook'.padEnd(boxWidth)} │   ${'Location'.padEnd(boxWidth)}`))
    log(bold(`${SUBTEXT_PADDING}└─${line}─┴─${secondLine}─`))
  }

  const linePrefix = name.startsWith('config.build')
    ? `Config ${cyanBright(basename(configPath))} ${yellowBright(name.replace('config.', ''))}`
    : `Plugin`

  let msg
  if (name.startsWith('config.build')) {
    //  in ${basename(configPath)}
    msg = `${white(linePrefix)}`
  } else if (core) {
    msg = `${white(linePrefix)} ${yellowBright(name)} in build core`
  } else {
    msg = `${white(linePrefix)} ${name} ${yellowBright(type)}`
  }

  // const locationText = type ? `${location}` : ''
  const showArrow = buildInstructions.length === index + 1 ? ' ' : arrowDown
  log(cyanBright.bold(`${SUBTEXT_PADDING}┌─${line}─┐ `))
  log(cyanBright.bold(`${SUBTEXT_PADDING}│ ${count} ${hook.padEnd(boxWidth - textOffset)} ${showArrow} │  ${msg}`))
  log(cyanBright.bold(`${SUBTEXT_PADDING}└─${line}─┘ `))
}

const logDryRunEnd = function() {
  log()
  log(`${SUBTEXT_PADDING}If this looks good to you, run \`netlify build\` to execute the build`)
  log()
}

const logInstruction = function({ hook, name, override }, { index, configPath, error }) {
  log()
  if (override.hook) {
    log(
      redBright.bold(
        `${HEADING_PREFIX} OVERRIDE: "${override.hook}" method in "${override.type}" has been overriden by "${name}"`
      )
    )
  }
  const lifecycleName = error ? '' : 'lifecycle '
  const source = name.startsWith('config.build') ? ` in ${basename(configPath)} config file` : ''
  const niceName = name.startsWith('config.build') ? name.replace(/^config\./, '') : name
  const logColor = error ? redBright : cyanBright
  const outputNoChalk = `${index + 1}. Running ${hook} ${lifecycleName}from ${niceName}${source}`
  const output = `${index + 1}. Running ${bold(hook)} ${lifecycleName}from ${bold(niceName)}${source}`
  const line = '─'.repeat(outputNoChalk.length + 2)
  log(logColor.bold(`┌─${line}─┐`))
  log(logColor.bold(`│ ${output}   │`))
  log(logColor.bold(`└─${line}─┘`))
  log()
}

const logCommandStart = function(cmd) {
  log(`${yellowBright(`Running command "${cmd}"`)}`)
}

const logCommandError = function(name, hook, error) {
  log(redBright(`Error in "${hook}" step from "${name}"`))
  log()
  log(redBright('Error message\n'))
  log(error.message)
  // TODO: enable once we stop use piping child processes to parent process
  // with `pipe()`
  // log(error.stderr)
  log()
}

const logInstructionSuccess = function() {
  log()
}

const logTimer = function(durationMs, hook, context) {
  const hookA = hook ? `.${bold(hook)}` : ''
  const contextA = context.replace('config.', '')
  const contextB = contextA.startsWith('build.lifecycle') ? 'build.lifecycle' : contextA

  log(` ${greenBright(tick)}  ${greenBright.bold(contextB)}${hookA} completed in ${durationMs}ms`)
}

const logManifest = function(manifest) {
  if (Object.keys(manifest).length === 0) {
    return
  }

  log('Manifest:')
  log(manifest)
}

const logTomlWrite = function(tomlPath, toml) {
  log()
  log('TOML output:')
  log()
  log(toml)
  log(`TOML file written to ${tomlPath}`)
}

const logInstructionsError = function() {
  log()
  log(redBright.bold('┌─────────────────────┐'))
  log(redBright.bold('│  Lifecycle Error!   │'))
  log(redBright.bold('└─────────────────────┘'))
}

const logErrorInstructions = function() {
  log()
  log(cyanBright('Running onError methods'))
}

const logBuildError = function(error, { verbose }) {
  log(redBright.bold('┌─────────────────────────────┐'))
  log(redBright.bold('│    Netlify Build Error!     │'))
  log(redBright.bold('└─────────────────────────────┘'))
  log(bold(` ${error.message}`))
  log()
  log(yellowBright.bold('┌─────────────────────────────┐'))
  log(yellowBright.bold('│      Error Stack Trace      │'))
  log(yellowBright.bold('└─────────────────────────────┘'))

  if (verbose) {
    log(error.stack)
  } else {
    log(` ${bold(cleanStack(error.stack))}`)
    log()
    log(` Use the --verbose option for deep traces`)
  }

  log()
}

const logBuildSuccess = function() {
  log()
  log(greenBright.bold('┌─────────────────────────────┐'))
  log(greenBright.bold('│   Netlify Build Complete!   │'))
  log(greenBright.bold('└─────────────────────────────┘'))
  log()
}

const logBuildEnd = function({ instructions, config, duration }) {
  const sparkles = cyanBright('(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧')
  log(`\n${sparkles} Have a nice day!\n`)
  const plugins = Object.values(config.plugins).map(({ type }) => type)
  // telemetry noOps if BUILD_TELEMETRY_DISBALED set
  telemetry.track('buildComplete', {
    steps: instructions.length,
    duration,
    pluginCount: plugins.length,
    plugins
  })
}

module.exports = {
  logBuildStart,
  logOptions,
  logConfigPath,
  logInstallPlugins,
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
