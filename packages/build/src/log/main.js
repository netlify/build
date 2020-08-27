const { cleanupConfig } = require('@netlify/config')
const { arrowDown } = require('figures')
const prettyMs = require('pretty-ms')

const { name, version } = require('../../package.json')
const { isSuccessException } = require('../error/cancel')
const { serializeLogError } = require('../error/parse/serialize_log')
const { roundTimerToMillisecs } = require('../time/measure')
const { omit } = require('../utils/omit')

const { getCommandDescription, getBuildCommandDescription, getPluginOrigin } = require('./description')
const {
  log,
  logMessage,
  logObject,
  logArray,
  logHeader,
  logErrorHeader,
  logSubHeader,
  logErrorSubHeader,
} = require('./logger')
const { logOldCliVersionError } = require('./old_version')
const { THEME } = require('./theme')

const logBuildStart = function(logs) {
  logHeader(logs, 'Netlify Build')
  logSubHeader(logs, 'Version')
  logMessage(logs, `${name} ${version}`)
}

const logFlags = function(logs, flags, { debug }) {
  const hiddenFlags = debug ? HIDDEN_DEBUG_FLAGS : HIDDEN_FLAGS
  const flagsA = omit(flags, hiddenFlags)
  logSubHeader(logs, 'Flags')
  logObject(logs, flagsA)
}

// Hidden because the value is security-sensitive
const SECURE_FLAGS = ['token', 'bugsnagKey', 'env', 'cachedConfig', 'defaultConfig']
// Hidden because those are used in tests
const TEST_FLAGS = ['buffer', 'telemetry']
// Hidden because those are only used internally
const INTERNAL_FLAGS = ['nodePath', 'functionsDistDir', 'buildImagePluginsDir', 'sendStatus', 'statsd', 'framework']
const HIDDEN_FLAGS = [...SECURE_FLAGS, ...TEST_FLAGS, ...INTERNAL_FLAGS]
const HIDDEN_DEBUG_FLAGS = [...SECURE_FLAGS, ...TEST_FLAGS]

const logBuildDir = function(logs, buildDir) {
  logSubHeader(logs, 'Current directory')
  logMessage(logs, buildDir)
}

const logConfigPath = function(logs, configPath = NO_CONFIG_MESSAGE) {
  logSubHeader(logs, 'Config file')
  logMessage(logs, configPath)
}

const NO_CONFIG_MESSAGE = 'No config file was defined: using default values.'

const logConfig = function({ logs, netlifyConfig, debug }) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'Resolved config')
  logObject(logs, cleanupConfig(netlifyConfig))
}

const logConfigOnError = function({ logs, error, netlifyConfig }) {
  if (netlifyConfig === undefined || isSuccessException(error)) {
    return
  }

  logMessage(logs, THEME.errorSubHeader('Resolved config'))
  logObject(logs, cleanupConfig(netlifyConfig))
}

const logContext = function(logs, context) {
  if (context === undefined) {
    return
  }

  logSubHeader(logs, 'Context')
  logMessage(logs, context)
}

const logInstallMissingPlugins = function(logs, packages) {
  logSubHeader(logs, 'Installing plugins')
  logArray(logs, packages)
}

const logMissingPluginsWarning = function(logs, packages) {
  logErrorSubHeader(logs, 'Missing plugins')
  logMessage(
    logs,
    THEME.errorSubHeader(
      `The following plugins should be installed either via the Netlify app or as a "dependency" inside your project's "package.json"`,
    ),
  )
  logArray(logs, packages, { color: THEME.errorSubHeader })
}

const logInstallLocalPluginsDeps = function(logs, localPluginsOptions) {
  const packages = localPluginsOptions.map(getPackage)
  logSubHeader(logs, 'Installing local plugins dependencies')
  logArray(logs, packages)
}

const logInstallFunctionDependencies = function() {
  log(undefined, 'Installing functions dependencies')
}

const getPackage = function({ package }) {
  return package
}

const logLoadingPlugins = function(logs, pluginsOptions) {
  const loadingPlugins = pluginsOptions.filter(isNotCorePlugin).map(getPluginDescription)

  if (loadingPlugins.length === 0) {
    return
  }

  logSubHeader(logs, 'Loading plugins')
  logArray(logs, loadingPlugins)
}

// We only logs plugins explicitly enabled by users
const isNotCorePlugin = function({ origin }) {
  return origin !== 'core'
}

const getPluginDescription = function({ package, pluginPackageJson: { version }, loadedFrom, origin }) {
  const versionA = version === undefined ? '' : `@${version}`
  const pluginOrigin = getPluginOrigin(loadedFrom, origin)
  return `${THEME.highlightWords(package)}${versionA} ${pluginOrigin}`
}

const logDryRunStart = function({ logs, eventWidth, commandsCount }) {
  const columnWidth = getDryColumnWidth(eventWidth, commandsCount)
  const line = '─'.repeat(columnWidth)
  const secondLine = '─'.repeat(columnWidth)

  logSubHeader(logs, 'Netlify Build Commands')
  logMessage(
    logs,
    `For more information on build events see the docs https://github.com/netlify/build

Running \`netlify build\` will execute this build flow

${THEME.header(`┌─${line}─┬─${secondLine}─┐
│ ${DRY_HEADER_NAMES[0].padEnd(columnWidth)} │ ${DRY_HEADER_NAMES[1].padEnd(columnWidth)} │
└─${line}─┴─${secondLine}─┘`)}`,
  )
}

const logDryRunCommand = function({
  logs,
  command: { event, package, buildCommandOrigin },
  index,
  eventWidth,
  commandsCount,
}) {
  const columnWidth = getDryColumnWidth(eventWidth, commandsCount)
  const line = '─'.repeat(columnWidth)
  const countText = `${index + 1}. `
  const downArrow = commandsCount === index + 1 ? '  ' : ` ${arrowDown}`
  const eventWidthA = columnWidth - countText.length - downArrow.length
  const fullName = getPluginFullName({ package, buildCommandOrigin })

  logMessage(
    logs,
    `${THEME.header(`┌─${line}─┐`)}
${THEME.header(`│ ${countText}${event.padEnd(eventWidthA)}${downArrow} │`)} ${fullName}
${THEME.header(`└─${line}─┘ `)}`,
  )
}

const getPluginFullName = function({ package, buildCommandOrigin }) {
  if (buildCommandOrigin !== undefined) {
    return getBuildCommandDescription(buildCommandOrigin)
  }

  return `Plugin ${THEME.highlightWords(package)}`
}

const getDryColumnWidth = function(eventWidth, commandsCount) {
  const symbolsWidth = `${commandsCount}`.length + 4
  return Math.max(eventWidth + symbolsWidth, DRY_HEADER_NAMES[1].length)
}

const DRY_HEADER_NAMES = ['Event', 'Location']

const logDryRunEnd = function(logs) {
  logMessage(logs, `\nIf this looks good to you, run \`netlify build\` to execute the build\n`)
}

const logCommand = function({ logs, event, buildCommandOrigin, package, index, error }) {
  const description = getCommandDescription({ event, buildCommandOrigin, package })
  const logHeaderFunc = error && !isSuccessException(error) ? logErrorHeader : logHeader
  logHeaderFunc(logs, `${index + 1}. ${description}`)
  logMessage(logs, '')
}

const logBuildCommandStart = function(logs, buildCommand) {
  log(logs, THEME.highlightWords(`$ ${buildCommand}`))
}

const logCommandSuccess = function(logs) {
  logMessage(logs, '')
}

const logTimer = function(logs, durationNs, timerName) {
  const durationMs = roundTimerToMillisecs(durationNs)
  const duration = prettyMs(durationMs)
  log(logs, THEME.dimWords(`(${timerName} completed in ${duration})`))
}

// Print the list of Netlify Functions about to be bundled
const logFunctionsToBundle = async function(functions, FUNCTIONS_SRC) {
  if (functions.length === 0) {
    log(undefined, `No Functions were found in ${THEME.highlightWords(FUNCTIONS_SRC)} directory`)
    return
  }

  log(undefined, `Packaging Functions from ${THEME.highlightWords(FUNCTIONS_SRC)} directory:`)
  logArray(undefined, functions, { indent: false })
}

const logStatuses = function(logs, statuses) {
  logHeader(logs, 'Summary')
  statuses.forEach(status => logStatus(logs, status))
}

const logStatus = function(logs, { package, title = `Plugin ${package} ran successfully`, summary, text }) {
  const titleA = title.includes(package) ? title : `${package}: ${title}`
  const body = text === undefined ? summary : `${summary}\n${THEME.dimWords(text)}`
  logSubHeader(logs, titleA)
  logMessage(logs, body)
}

const logBuildError = function({ error, netlifyConfig, mode, logs, debug, testOpts }) {
  const { title, body, isSuccess } = serializeLogError(error, { debug })
  const logFunction = isSuccess ? logHeader : logErrorHeader
  logFunction(logs, title)
  logMessage(logs, `\n${body}\n`)
  logConfigOnError({ logs, error, netlifyConfig })
  logOldCliVersionError({ mode, testOpts })
}

const logBuildSuccess = function(logs) {
  logHeader(logs, 'Netlify Build Complete')
  logMessage(logs, '')
}

module.exports = {
  logBuildStart,
  logFlags,
  logBuildDir,
  logConfigPath,
  logConfig,
  logContext,
  logInstallMissingPlugins,
  logMissingPluginsWarning,
  logInstallLocalPluginsDeps,
  logInstallFunctionDependencies,
  logLoadingPlugins,
  logDryRunStart,
  logDryRunCommand,
  logDryRunEnd,
  logCommand,
  logBuildCommandStart,
  logCommandSuccess,
  logTimer,
  logStatuses,
  logFunctionsToBundle,
  logBuildError,
  logBuildSuccess,
}
