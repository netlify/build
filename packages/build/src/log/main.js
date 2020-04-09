const { basename } = require('path')
const {
  env: { NETLIFY_BUILD_DEBUG },
} = require('process')

const prettyMs = require('pretty-ms')
const stringWidth = require('string-width')

const { name, version } = require('../../package.json')
const { serializeError } = require('../error/serialize')
const { serializeList } = require('../utils/list')
const { omit } = require('../utils/omit')

const { EMPTY_LINE, HEADING_PREFIX, ARROW_DOWN } = require('./constants')
const { log } = require('./logger')
const { serialize, SUBTEXT_PADDING, indent } = require('./serialize')
const { THEME } = require('./theme')

const logBuildStart = function() {
  log(
    `${EMPTY_LINE}
${THEME.header(getHeader('Netlify Build'))}
${EMPTY_LINE}
${THEME.subHeader(`${HEADING_PREFIX} Version`)}
${SUBTEXT_PADDING}${name} ${version}
${EMPTY_LINE}`,
  )
}

const logFlags = function(flags) {
  const hiddenFlags = flags.mode === 'buildbot' ? [...HIDDEN_FLAGS, 'nodePath'] : HIDDEN_FLAGS
  const flagsA = omit(flags, hiddenFlags)
  log(THEME.subHeader(`${HEADING_PREFIX} Flags`), serialize(flagsA), EMPTY_LINE)
}

const HIDDEN_FLAGS = ['token', 'cachedConfig', 'defaultConfig']

const logBuildDir = function(buildDir) {
  log(`${THEME.subHeader(`${HEADING_PREFIX} Current directory`)}
${SUBTEXT_PADDING}${buildDir}
${EMPTY_LINE}`)
}

const logConfigPath = function(configPath = NO_CONFIG_MESSAGE) {
  log(`${THEME.subHeader(`${HEADING_PREFIX} Config file`)}
${SUBTEXT_PADDING}${configPath}
${EMPTY_LINE}`)
}

const NO_CONFIG_MESSAGE = 'No config file was defined: using default values.'

const logConfig = function(config) {
  if (!NETLIFY_BUILD_DEBUG) {
    return
  }

  log(THEME.subHeader(`${HEADING_PREFIX} Resolved config`), serialize(simplifyConfig(config)), EMPTY_LINE)
}

// The resolved configuration gets assigned some default values (empty objects and arrays)
// to make it more convenient to use without checking for `undefined`.
// However those empty values are not useful to users, so we don't log them.
const simplifyConfig = function({ build: { environment, lifecycle, ...build }, plugins, ...config }) {
  const simplifiedBuild = {
    ...build,
    ...removeEmptyObject(environment, 'environment'),
    ...removeEmptyObject(lifecycle, 'lifecycle'),
  }
  return {
    ...config,
    ...removeEmptyObject(simplifiedBuild, 'build'),
    ...removeEmptyArray(plugins, 'plugins'),
  }
}

const removeEmptyObject = function(object, propName) {
  return Object.keys(object).length === 0 ? {} : { [propName]: object }
}

const removeEmptyArray = function(array, propName) {
  return array.length === 0 ? {} : { [propName]: array }
}

const logContext = function(context) {
  if (context === undefined) {
    return
  }

  log(`${THEME.subHeader(`${HEADING_PREFIX} Context`)}
${SUBTEXT_PADDING}${context}
${EMPTY_LINE}`)
}

const logInstallMissingPlugins = function(packages) {
  log(`${THEME.subHeader(`${HEADING_PREFIX} Installing plugins`)}
${indent(serializeList(packages))}
${EMPTY_LINE}`)
}

const logInstallLocalPluginsDeps = function(localPluginsOptions) {
  const packages = localPluginsOptions.map(getPackage)
  log(`${THEME.subHeader(`${HEADING_PREFIX} Installing local plugins dependencies`)}
${indent(serializeList(packages))}
${EMPTY_LINE}`)
}

const getPackage = function({ package }) {
  return package
}

const logLoadPlugins = function() {
  log(THEME.subHeader(`${HEADING_PREFIX} Loading plugins`))
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
  return `${SUBTEXT_PADDING} - ${package}${location}`
}

const logDryRunStart = function(eventWidth, commandsCount) {
  const columnWidth = getDryColumnWidth(eventWidth, commandsCount)
  const line = '─'.repeat(columnWidth)
  const secondLine = '─'.repeat(columnWidth)

  log(`
${THEME.subHeader(`${HEADING_PREFIX} Netlify Build Commands`)}
${SUBTEXT_PADDING}For more information on build events see the docs https://github.com/netlify/build

${SUBTEXT_PADDING}Running \`netlify build\` will execute this build flow

${THEME.header(`${SUBTEXT_PADDING}┌─${line}─┬─${secondLine}─┐
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
    `${THEME.header(`${SUBTEXT_PADDING}┌─${line}─┐`)}
${THEME.header(`${SUBTEXT_PADDING}│ ${countText}${event.padEnd(eventWidthA)}${downArrow} │`)} ${location}
${THEME.header(`${SUBTEXT_PADDING}└─${line}─┘ `)}`,
  )
}

const getPluginLocation = function({ prop, package, core, configPath }) {
  if (prop !== undefined) {
    return `Config ${basename(configPath)} ${THEME.highlightWords(prop)}`
  }

  if (core) {
    return `Plugin ${THEME.highlightWords(package)} in build core`
  }

  return `Plugin ${THEME.highlightWords(package)}`
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
  const description = prop === undefined ? `${event} command from ${package}` : `${prop} command${configName}`
  const logColor = error ? THEME.errorHeader : THEME.header
  const header = `${index}. ${description}`
  log(`
${logColor(getHeader(header))}
${EMPTY_LINE}`)
}

const logShellCommandStart = function(shellCommand) {
  log(THEME.highlightWords(`$ ${shellCommand}`))
}

const logCommandSuccess = function() {
  log(EMPTY_LINE)
}

const logTimer = function(durationMs, timerName) {
  const duration = prettyMs(durationMs)
  log(THEME.dimWords(`(${timerName} completed in ${duration})`))
}

const logCacheStart = function() {
  log(THEME.subHeader(`${HEADING_PREFIX} Caching artifacts`))
}

const logCacheDir = function(path) {
  log(`${SUBTEXT_PADDING}Caching ${path}`)
}

const logPluginError = function(error) {
  const { header, body, isSuccess } = serializeError(error)
  const color = isSuccess ? THEME.header : THEME.errorHeader
  log(`${color(getHeader(header))}
${EMPTY_LINE}
${body}`)
}

const logBuildError = function(error) {
  const { header, body, isSuccess } = serializeError(error)
  const color = isSuccess ? THEME.header : THEME.errorHeader
  log(`${EMPTY_LINE}
${color(getHeader(header))}
${EMPTY_LINE}
${body}
${EMPTY_LINE}`)
}

const logBuildSuccess = function() {
  log(`${EMPTY_LINE}
${THEME.header(getHeader('Netlify Build Complete'))}
${EMPTY_LINE}`)
}

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
  logConfig,
  logContext,
  logInstallMissingPlugins,
  logInstallLocalPluginsDeps,
  logLoadPlugins,
  logLoadedPlugins,
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
}
