const { basename } = require('path')

const { tick, pointer, arrowDown } = require('figures')
const omit = require('omit.js')

const { DEFAULT_PLUGINS } = require('../plugins/constants')

const { startPatchingLog, stopPatchingLog } = require('./patch')
const { cleanStack } = require('./stack')

// eslint-disable-next-line import/order
const { greenBright, cyanBright, redBright, yellowBright, bold } = require('chalk')

const HEADING_PREFIX = pointer
const SUBTEXT_PADDING = '  '

const logBuildStart = function() {
  console.log(greenBright.bold(`${HEADING_PREFIX} Starting Netlify Build`))
  console.log(`${SUBTEXT_PADDING}https://github.com/netlify/build`)
  console.log()
}

const logOptions = function(options) {
  const opts = omit(options, ['token', 'dry'])
  if (Object.keys(opts).length) {
    console.log(cyanBright.bold('Options'))
    console.log(' ', opts)
    console.log()
  }
}

const logConfigPath = function(configPath) {
  console.log(cyanBright.bold(`${HEADING_PREFIX} Using config file:`))
  console.log(`${SUBTEXT_PADDING}${configPath}`)
  console.log()
}

const logLoadPlugins = function() {
  console.log(cyanBright.bold(`${HEADING_PREFIX} Loading plugins`))
}

const logLoadPlugin = function(pluginId, loc) {
  const location = (Object.keys(DEFAULT_PLUGINS).includes(pluginId)) ? 'build core' : loc
  console.log(yellowBright(`${SUBTEXT_PADDING}Loading plugin "${pluginId}" from ${location}`))
}

const logLifeCycleStart = function(instructions) {
  console.log()
  console.log(greenBright.bold(`${HEADING_PREFIX} Running Netlify Build Lifecycle`))
  const stepsWord = instructions.length === 1 ? 'step' : `steps`
  console.log(`${SUBTEXT_PADDING}Found ${instructions.length} ${stepsWord}. Lets do this!`)
}

const logDryRunStart = function() {
  console.log()
  console.log(cyanBright.bold(`${HEADING_PREFIX} Netlify Build Steps`))
  console.log(
    `${SUBTEXT_PADDING}For more information on build lifecycles see the docs https://github.com/netlify/build`
  )
  console.log()
  console.log(`${SUBTEXT_PADDING}Running \`netlify build\` will execute this build flow`)
  console.log()
}

const logDryRunInstruction = function({ instruction: { name, hook }, index, configPath, width, buildInstructions }) {
  const pluginData = buildInstructions[index] || {}
  const isLastInstruction = buildInstructions.length === index + 1
  const source = name.startsWith('config.build') ? `in ${basename(configPath)}` : 'plugin'
  const countText = `${index + 1}.`
  const count = cyanBright(countText)
  const niceName = name.startsWith('config.build') ? name.replace('config.', '') : name
  const boxWidth = width + countText.length + 3
  const line = '─'.repeat(boxWidth)

  if (index === 0) {
    console.log(bold(`${SUBTEXT_PADDING}┌─${line}─┬─${line}─`))
    console.log(bold(`${SUBTEXT_PADDING}│ ${'Lifecycle name'.padEnd(boxWidth)} │  ${'Location'.padEnd(boxWidth)}`))
    console.log(bold(`${SUBTEXT_PADDING}└─${line}─┴─${line}─`))
  }

  const srcLocation = pluginData.type ? ` in ${pluginData.type}` : ''
  const showArrow = isLastInstruction ? ' ' : arrowDown
  console.log(cyanBright.bold(`${SUBTEXT_PADDING}┌─${line}─┐ `))
  console.log(
    cyanBright.bold(
      `${SUBTEXT_PADDING}│ ${count} ${hook.padEnd(boxWidth - 5)} ${showArrow} │ via ${niceName} ${source}${srcLocation}`
    )
  )
  console.log(cyanBright.bold(`${SUBTEXT_PADDING}└─${line}─┘ `))
  // ├ if folding
  if (isLastInstruction) {
    console.log(`${SUBTEXT_PADDING}If this looks good to you, run \`netlify build\` to execute the build`)
  }
}

const logDryRunEnd = function() {
  console.log()
}

const logInstruction = function({ hook, name, override, index, configPath, error }) {
  console.log()
  if (override.hook) {
    console.log(
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
  console.log(logColor.bold(`┌─${line}─┐`))
  console.log(logColor.bold(`│ ${output}   │`))
  console.log(logColor.bold(`└─${line}─┘`))
  console.log()
}

const logCommandStart = function(cmd) {
  console.log(`${yellowBright(`Running command "${cmd}"`)}`)
}

const logCommandError = function(cmd, name, error) {
  console.log(redBright(`${SUBTEXT_PADDING}Error from netlify config ${name}:`))
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
  console.log(manifest)
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

const logBuildError = function(error, { verbose }) {
  console.log()
  console.log(redBright.bold('┌─────────────────────────────┐'))
  console.log(redBright.bold('│    Netlify Build Error!     │'))
  console.log(redBright.bold('└─────────────────────────────┘'))
  console.log(bold(` ${error.message}`))
  console.log()
  console.log(yellowBright.bold('┌─────────────────────────────┐'))
  console.log(yellowBright.bold('│      Error Stack Trace      │'))
  console.log(yellowBright.bold('└─────────────────────────────┘'))

  if (verbose) {
    console.log(error.stack)
  } else {
    console.log(` ${bold(cleanStack(error.stack))}`)
    console.log()
    console.log(` Use the --verbose option for deep traces`)
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
