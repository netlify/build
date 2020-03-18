const { basename } = require('path')
const { platform } = require('process')

const stringWidth = require('string-width')
const { greenBright, cyanBright, redBright, yellowBright, bold, white } = require('chalk')
const omit = require('omit.js')

const { version } = require('../../package.json')
const { serializeError } = require('../error/serialize')
const isNetlifyCI = require('../utils/is-netlify-ci')

const { log } = require('./logger')
const { serialize, indent, SUBTEXT_PADDING } = require('./serialize')
const { EMPTY_LINE, HEADING_PREFIX, TICK, ARROW_DOWN } = require('./constants')

const logBuildStart = function() {
  log(`${EMPTY_LINE}
${greenBright.bold(`${HEADING_PREFIX} Starting Netlify Build v${version}`)}
${SUBTEXT_PADDING}https://github.com/netlify/build
${EMPTY_LINE}`)
}

const logFlags = function(flags) {
  const flagsA = omit(flags, HIDDEN_FLAGS)
  log(cyanBright.bold(`${HEADING_PREFIX} Flags`), indent(serialize(flagsA)).trimRight(), EMPTY_LINE)
}

const CI_HIDDEN_FLAGS = isNetlifyCI() ? ['nodePath'] : []
const HIDDEN_FLAGS = ['token', 'cachedConfig', 'defaultConfig', ...CI_HIDDEN_FLAGS]

const logBuildDir = function(buildDir) {
  log(`${cyanBright.bold(`${HEADING_PREFIX} Current directory`)}
${SUBTEXT_PADDING}${buildDir}
${EMPTY_LINE}`)
}

const logConfigPath = function(configPath) {
  if (configPath === undefined) {
    log(`${cyanBright.bold(`${HEADING_PREFIX} No config file was defined: using default values.`)}
${EMPTY_LINE}`)
    return
  }

  log(`${cyanBright.bold(`${HEADING_PREFIX} Config file`)}
${SUBTEXT_PADDING}${configPath}
${EMPTY_LINE}`)
}

const logInstallPlugins = function() {
  log(cyanBright.bold(`${HEADING_PREFIX} Installing plugins dependencies`))
}

const logLoadPlugins = function() {
  log(cyanBright.bold(`${HEADING_PREFIX} Loading plugins`))
}

const logLoadedPlugins = function(pluginCommands) {
  const loadedPlugins = pluginCommands
    .filter(isNotDuplicate)
    .map(getLoadedPlugin)
    .join('\n')
  log(loadedPlugins)
}

const isNotDuplicate = function(pluginCommand, index, pluginCommands) {
  return !pluginCommands
    .slice(index + 1)
    .some(laterPluginCommand => laterPluginCommand.package === pluginCommand.package)
}

const getLoadedPlugin = function({ package, core, packageJson: { version } }) {
  const location = core ? ' from build core' : version === undefined ? '' : `@${version}`
  return `${SUBTEXT_PADDING} - ${greenBright.bold(package)}${location}`
}

const logCommandsStart = function(commandsCount) {
  log(`${EMPTY_LINE}
${greenBright.bold(`${HEADING_PREFIX} Running Netlify Build Lifecycle`)}
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
  command: { prop, event, package, core },
  index,
  configPath,
  eventWidth,
  commandsCount,
}) {
  const columnWidth = getDryColumnWidth(eventWidth, commandsCount)
  const line = '─'.repeat(columnWidth)
  const countText = `${index + 1}. `
  const downArrow = commandsCount === index + 1 ? '  ' : ` ${ARROW_DOWN}`
  const eventWidthA = columnWidth - countText.length - downArrow.length
  const location = getPluginLocation({ prop, package, core, configPath })

  log(
    cyanBright.bold(`${SUBTEXT_PADDING}┌─${line}─┐
${SUBTEXT_PADDING}│ ${cyanBright(countText)}${event.padEnd(eventWidthA)}${downArrow} │ ${location}
${SUBTEXT_PADDING}└─${line}─┘ `),
  )
}

const getPluginLocation = function({ prop, package, core, configPath }) {
  if (prop !== undefined) {
    return `${white('Config')} ${cyanBright(basename(configPath))} ${yellowBright(prop)}`
  }

  if (core) {
    return `${white('Plugin')} ${yellowBright(package)} in build core`
  }

  return `${white('Plugin')} ${yellowBright(package)}`
}

const getDryColumnWidth = function(eventWidth, commandsCount) {
  const symbolsWidth = `${commandsCount}`.length + 4
  return Math.max(eventWidth + symbolsWidth, DRY_HEADER_NAMES[0].length)
}

const DRY_HEADER_NAMES = ['Event', 'Location']

const logDryRunEnd = function() {
  log(`${EMPTY_LINE}
${SUBTEXT_PADDING}If this looks good to you, run \`netlify build\` to execute the build
${EMPTY_LINE}`)
}

const logCommand = function({ event, prop, package }, { index, configPath, error }) {
  const configName = configPath === undefined ? '' : ` from ${basename(configPath)} config file`
  const description =
    prop === undefined ? `${bold(event)} command from ${bold(package)}` : `${bold(prop)} command${configName}`
  const logColor = error ? redBright.bold : cyanBright.bold
  const header = `${index}. Running ${description}`
  log(
    logColor(`
${getHeader(header)}
${EMPTY_LINE}`),
  )
}

const logShellCommandStart = function(shellCommand) {
  log(yellowBright(`Running command "${shellCommand}"`))
}

const logCommandSuccess = function() {
  log(EMPTY_LINE)
}

const logTimer = function(durationMs, timerName) {
  log(` ${greenBright(TICK)}  ${greenBright.bold(timerName)} completed in ${durationMs}ms`)
}

const logCacheStart = function() {
  log(cyanBright.bold(`${HEADING_PREFIX} Caching artifacts`))
}

const logCacheDir = function(path) {
  log(`${SUBTEXT_PADDING}Caching ${path}`)
}

const logPluginError = function(error) {
  const { header, body, color } = serializeError(error)
  log(`${color.bold(getHeader(header))}
${EMPTY_LINE}
${body}`)
}

const logBuildError = function(error) {
  const { header, body, color } = serializeError(error)
  log(`${EMPTY_LINE}
${color.bold(getHeader(header))}
${EMPTY_LINE}
${body}
${EMPTY_LINE}`)
}

const logBuildSuccess = function() {
  log(
    greenBright.bold(`${EMPTY_LINE}
${getHeader('Netlify Build Complete')}
${EMPTY_LINE}`),
  )
}

const logBuildEnd = function() {
  log(`${EMPTY_LINE}
${cyanBright(SPARKLES)} Have a nice day!
${EMPTY_LINE}`)
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
  logBuildDir,
  logConfigPath,
  logInstallPlugins,
  logLoadPlugins,
  logLoadedPlugins,
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
  logPluginError,
  logBuildError,
  logBuildSuccess,
  logBuildEnd,
}
