const { basename } = require('path')
const { platform } = require('process')

const { tick, pointer, arrowDown } = require('figures')
const stringWidth = require('string-width')
const { greenBright, cyanBright, redBright, yellowBright, bold, white } = require('chalk')
const filterObj = require('filter-obj')

const { version } = require('../../package.json')

const { log } = require('./logger')
const { cleanStacks } = require('./stack.js')

const HEADING_PREFIX = pointer
const SUBTEXT_PADDING = '  '

const logBuildStart = function() {
  log(`${greenBright.bold(`${HEADING_PREFIX} Starting Netlify Build v${version}`)}
${SUBTEXT_PADDING}https://github.com/netlify/build
`)
}

const logFlags = function(flags) {
  const flagsA = filterObj(flags, isDefined)
  if (Object.keys(flagsA).length !== 0) {
    log(cyanBright.bold('Flags'), flagsA, '')
  }
}

const isDefined = function(key, value) {
  return value !== undefined
}

const logConfigPath = function(configPath) {
  if (configPath === undefined) {
    log(`${cyanBright.bold(`${HEADING_PREFIX} No config file was defined: using default values.`)}`)
    return
  }

  log(`${cyanBright.bold(`${HEADING_PREFIX} Using config file:`)}
${SUBTEXT_PADDING}${configPath}
`)
}

const logInstallPlugins = function() {
  log(cyanBright.bold(`${HEADING_PREFIX} Installing plugins dependencies`))
}

const logLoadPlugins = function() {
  log(cyanBright.bold(`\n${HEADING_PREFIX} Loading plugins`))
}

const logLoadPlugin = function(id, package, core) {
  const idA = id === undefined ? '' : `"${id}" `
  const location = core ? 'build core' : package
  log(yellowBright(`${SUBTEXT_PADDING}Loading plugin ${idA}from ${location}`))
}

const logCommandsStart = function(commandsCount) {
  log(`\n${greenBright.bold(`${HEADING_PREFIX} Running Netlify Build Lifecycle`)}
${SUBTEXT_PADDING}Found ${commandsCount} commands. Lets do this!`)
}

const logDryRunStart = function(eventWidth, commandsCount) {
  const columnWidth = getDryColumnWidth(eventWidth, commandsCount)
  const line = '─'.repeat(columnWidth)
  const secondLine = '─'.repeat(columnWidth)

  log(`
${cyanBright.bold(`${HEADING_PREFIX} Netlify Build Commands`)}
${SUBTEXT_PADDING}For more information on build events see the docs https://github.com/netlify/build

${SUBTEXT_PADDING}Running \`netlify build\` will execute this build flow

${bold(`${SUBTEXT_PADDING}┌─${line}─┬─${secondLine}─┐
${SUBTEXT_PADDING}│ ${DRY_HEADER_NAMES[0].padEnd(columnWidth)} │ ${DRY_HEADER_NAMES[1].padEnd(columnWidth)} │
${SUBTEXT_PADDING}└─${line}─┴─${secondLine}─┘`)}`)
}

const logDryRunCommand = function({
  command: { id, event, package, core },
  index,
  configPath,
  eventWidth,
  commandsCount,
}) {
  const columnWidth = getDryColumnWidth(eventWidth, commandsCount)
  const line = '─'.repeat(columnWidth)
  const countText = `${index + 1}. `
  const downArrow = commandsCount === index + 1 ? '  ' : ` ${arrowDown}`
  const eventWidthA = columnWidth - countText.length - downArrow.length
  const location = getPluginLocation({ id, package, core, configPath })

  log(
    cyanBright.bold(`${SUBTEXT_PADDING}┌─${line}─┐
${SUBTEXT_PADDING}│ ${cyanBright(countText)}${event.padEnd(eventWidthA)}${downArrow} │ ${location}
${SUBTEXT_PADDING}└─${line}─┘ `),
  )
}

const getPluginLocation = function({ id, package, core, configPath }) {
  if (id.startsWith('config.')) {
    return `${white('Config')} ${cyanBright(basename(configPath))} ${yellowBright(id.replace('config.', ''))}`
  }

  if (core) {
    return `${white('Plugin')} ${yellowBright(id)} in build core`
  }

  return `${white('Plugin')} ${id} ${yellowBright(package)}`
}

const getDryColumnWidth = function(eventWidth, commandsCount) {
  const symbolsWidth = `${commandsCount}`.length + 4
  return Math.max(eventWidth + symbolsWidth, DRY_HEADER_NAMES[0].length)
}

const DRY_HEADER_NAMES = ['Event', 'Location']

const logDryRunEnd = function() {
  log(`
${SUBTEXT_PADDING}If this looks good to you, run \`netlify build\` to execute the build
`)
}

const logCommand = function({ event, id, override }, { index, configPath, error }) {
  const overrideWarning =
    override.event === undefined
      ? ''
      : redBright(`
${HEADING_PREFIX} OVERRIDE: "${override.event}" command in "${override.name}" has been overriden by "${id}"`)
  const configName = configPath === undefined ? '' : ` from ${basename(configPath)} config file`
  const description = id.startsWith('config.build')
    ? `${bold(id.replace('config.', ''))} command${configName}`
    : `${bold(event)} command from ${bold(id)}`
  const logColor = error ? redBright.bold : cyanBright.bold
  const header = `${index}. Running ${description}`
  log(logColor(`${overrideWarning}\n${getHeader(header)}\n`))
}

const logShellCommandStart = function(shellCommand) {
  log(yellowBright(`Running command "${shellCommand}"`))
}

const logCommandSuccess = function() {
  log('')
}

const logTimer = function(durationMs, event, id) {
  const eventA = event ? `.${bold(event)}` : ''
  const idA = id.replace('config.', '')
  const idB = idA.startsWith('build.lifecycle') ? 'build.lifecycle' : idA

  log(` ${greenBright(tick)}  ${greenBright.bold(idB)}${eventA} completed in ${durationMs}ms`)
}

const logCacheStart = function() {
  log(cyanBright.bold(`${HEADING_PREFIX} Caching artifacts`))
}

const logCacheDir = function(path) {
  log(`${SUBTEXT_PADDING}Caching ${path}`)
}

const logBuildError = function(error) {
  const errorStack = error.cleanStack ? cleanStacks(error.message) : `\n${error.stack}`
  log(`${redBright.bold(`\n${getHeader('Netlify Build Error')}`)}
${errorStack}
`)
}

const logBuildSuccess = function() {
  log(greenBright.bold(`\n${getHeader('Netlify Build Complete')}\n`))
}

const logBuildEnd = function() {
  log(`\n${cyanBright(SPARKLES)} Have a nice day!\n`)
}

const SPARKLES = platform === 'win32' ? '(/Ò_Ò)/' : '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧'

// Print a rectangular header
const getHeader = function(message) {
  const messageWidth = stringWidth(message)
  const headerWidth = Math.max(HEADER_MIN_WIDTH, messageWidth + MIN_PADDING * 2)
  const line = '─'.repeat(headerWidth)
  const paddingWidth = (headerWidth - messageWidth) / 2
  const paddingLeft = ' '.repeat(Math.floor(paddingWidth))
  const paddingRight = ' '.repeat(Math.ceil(paddingWidth))
  return `┌${line}┐
│${paddingLeft}${message}${paddingRight}│
└${line}┘`
}

const HEADER_MIN_WIDTH = 29
const MIN_PADDING = 1

module.exports = {
  logBuildStart,
  logFlags,
  logConfigPath,
  logInstallPlugins,
  logLoadPlugins,
  logLoadPlugin,
  logCommandsStart,
  logDryRunStart,
  logDryRunCommand,
  logDryRunEnd,
  logCommand,
  logShellCommandStart,
  logCommandSuccess,
  logTimer,
  logCacheStart,
  logCacheDir,
  logBuildError,
  logBuildSuccess,
  logBuildEnd,
}
