const { basename } = require('path')
const { platform, cwd } = require('process')

const { tick, pointer, arrowDown } = require('figures')
const stringWidth = require('string-width')
const { greenBright, cyanBright, redBright, yellowBright, bold, white } = require('chalk')
const omit = require('omit.js')

const { version } = require('../../package.json')

const { log } = require('./logger')
const { cleanStacks } = require('./stack')
const { EMPTY_LINE } = require('./empty')

const HEADING_PREFIX = pointer
const SUBTEXT_PADDING = '  '

const logBuildStart = function() {
  log(`${EMPTY_LINE}
${greenBright.bold(`${HEADING_PREFIX} Starting Netlify Build v${version}`)}
${SUBTEXT_PADDING}https://github.com/netlify/build
${EMPTY_LINE}`)
}

const logFlags = function(flags) {
  const flagsA = omit(flags, HIDDEN_FLAGS)
  log(cyanBright.bold(`${HEADING_PREFIX} Flags`), flagsA, EMPTY_LINE)
}

const HIDDEN_FLAGS = ['token']

const logCurrentDirectory = function() {
  log(`${cyanBright.bold(`${HEADING_PREFIX} Current directory`)}
${SUBTEXT_PADDING}${cwd()}
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

const logResolveError = function(error, package) {
  log(
    redBright.bold(
      `Error: '${package}' plugin not installed or found.
Please install it with npm or yarn.
${error.message}`,
    ),
  )
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
  return !pluginCommands.slice(index + 1).some(laterPluginCommand => laterPluginCommand.id === pluginCommand.id)
}

const getLoadedPlugin = function({ id, package, core, packageJson: { version } }) {
  const idA = id === undefined || id === package ? '' : `${greenBright.bold(id)} from `
  const versionA = version === undefined ? '' : `@${version}`
  const location = core ? 'build core' : `${greenBright.bold(package)}${versionA}`
  return `${SUBTEXT_PADDING} - ${idA}${location}`
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
  log(`${EMPTY_LINE}
${SUBTEXT_PADDING}If this looks good to you, run \`netlify build\` to execute the build
${EMPTY_LINE}`)
}

const logCommand = function({ event, id, override }, { index, configPath, error }) {
  const overrideWarning =
    override.event === undefined
      ? ''
      : redBright(`${EMPTY_LINE}
${HEADING_PREFIX} OVERRIDE: "${override.event}" command in "${override.name}" has been overriden by "${id}"`)
  const configName = configPath === undefined ? '' : ` from ${basename(configPath)} config file`
  const description = id.startsWith('config.build')
    ? `${bold(id.replace('config.', ''))} command${configName}`
    : `${bold(event)} command from ${bold(id)}`
  const logColor = error ? redBright.bold : cyanBright.bold
  const header = `${index}. Running ${description}`
  log(
    logColor(`${overrideWarning}
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
  log(`${EMPTY_LINE}
${redBright.bold(getHeader('Netlify Build Error'))}
${errorStack || EMPTY_LINE}
${EMPTY_LINE}
${redBright.bold(getHeader('END Netlify Build Error'))}
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
  logCurrentDirectory,
  logConfigPath,
  logResolveError,
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
  logBuildError,
  logBuildSuccess,
  logBuildEnd,
}
