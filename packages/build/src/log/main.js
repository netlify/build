const {
  env: { NETLIFY_BUILD_DEBUG },
} = require('process')

const { arrowDown } = require('figures')
const prettyMs = require('pretty-ms')

const { name, version } = require('../../package.json')
const { serializeError } = require('../error/serialize')
const { omit } = require('../utils/omit')

const { getCommandDescription, getBuildCommandDescription } = require('./description')
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
const { THEME } = require('./theme')

const logBuildStart = function() {
  logHeader('Netlify Build')
  logSubHeader('Version')
  logMessage(`${name} ${version}`)
}

const logFlags = function(flags) {
  const hiddenFlags = flags.mode === 'buildbot' ? [...HIDDEN_FLAGS, 'nodePath'] : HIDDEN_FLAGS
  const flagsA = omit(flags, hiddenFlags)
  logSubHeader('Flags')
  logObject(flagsA)
}

const HIDDEN_FLAGS = ['token', 'cachedConfig', 'defaultConfig']

const logBuildDir = function(buildDir) {
  logSubHeader('Current directory')
  logMessage(buildDir)
}

const logConfigPath = function(configPath = NO_CONFIG_MESSAGE) {
  logSubHeader('Config file')
  logMessage(configPath)
}

const NO_CONFIG_MESSAGE = 'No config file was defined: using default values.'

const logConfig = function(config) {
  if (!NETLIFY_BUILD_DEBUG) {
    return
  }

  logSubHeader('Resolved config')
  logObject(simplifyConfig(config))
}

// The resolved configuration gets assigned some default values (empty objects and arrays)
// to make it more convenient to use without checking for `undefined`.
// However those empty values are not useful to users, so we don't log them.
const simplifyConfig = function({ build: { environment, ...build }, plugins, ...config }) {
  const environmentA = omit(environment, BUILDBOT_ENVIRONMENT)
  const simplifiedBuild = {
    ...build,
    ...removeEmptyObject(environmentA, 'environment'),
  }
  return {
    ...config,
    ...removeEmptyObject(simplifiedBuild, 'build'),
    ...removeEmptyArray(plugins, 'plugins'),
  }
}

// Added by the buildbot. We only want to print environment variables specified
// by the user.
const BUILDBOT_ENVIRONMENT = [
  'BRANCH',
  'CONTEXT',
  'DEPLOY_PRIME_URL',
  'DEPLOY_URL',
  'GO_VERSION',
  'NETLIFY_IMAGES_CDN_DOMAIN',
  'URL',
]

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

  logSubHeader('Context')
  logMessage(context)
}

const logInstallMissingPlugins = function(packages) {
  logSubHeader('Installing plugins')
  logArray(packages)
}

const logInstallLocalPluginsDeps = function(localPluginsOptions) {
  const packages = localPluginsOptions.map(getPackage)
  logSubHeader('Installing local plugins dependencies')
  logArray(packages)
}

const logInstallFunctionDependencies = function() {
  log('Installing functions dependencies')
}

const logDeprecatedFunctionsInstall = function(functionsSrc) {
  logErrorSubHeader('Missing plugin')
  logMessage(
    THEME.errorLine(`Please use the plugin "@netlify/plugin-functions-install-core" to install dependencies from the "package.json" inside your "${functionsSrc}" directory.
Example "netlify.toml":

  [build]
  functions = "${functionsSrc}"

  [[plugins]]
  package = "@netlify/plugin-functions-install-core"`),
  )
}

const getPackage = function({ package }) {
  return package
}

const logLoadedPlugins = function(pluginsCommands) {
  const loadedPlugins = pluginsCommands
    .filter(isNotDuplicate)
    .filter(isNotCore)
    .map(getLoadedPlugin)

  if (loadedPlugins.length === 0) {
    return
  }

  logSubHeader('Loading plugins')
  logArray(loadedPlugins)
}

const isNotDuplicate = function(pluginCommand, index, pluginCommands) {
  return !pluginCommands
    .slice(index + 1)
    .some(laterPluginCommand => laterPluginCommand.package === pluginCommand.package)
}

const isNotCore = function({ core }) {
  return !core
}

const getLoadedPlugin = function({ package, packageJson: { version } }) {
  const location = version === undefined ? '' : `@${version}`
  return `${package}${location}`
}

const logDryRunStart = function(eventWidth, commandsCount) {
  const columnWidth = getDryColumnWidth(eventWidth, commandsCount)
  const line = '─'.repeat(columnWidth)
  const secondLine = '─'.repeat(columnWidth)

  logSubHeader('Netlify Build Commands')
  logMessage(`For more information on build events see the docs https://github.com/netlify/build

Running \`netlify build\` will execute this build flow

${THEME.header(`┌─${line}─┬─${secondLine}─┐
│ ${DRY_HEADER_NAMES[0].padEnd(columnWidth)} │ ${DRY_HEADER_NAMES[1].padEnd(columnWidth)} │
└─${line}─┴─${secondLine}─┘`)}`)
}

const logDryRunCommand = function({ command: { event, package }, index, configPath, eventWidth, commandsCount }) {
  const columnWidth = getDryColumnWidth(eventWidth, commandsCount)
  const line = '─'.repeat(columnWidth)
  const countText = `${index + 1}. `
  const downArrow = commandsCount === index + 1 ? '  ' : ` ${arrowDown}`
  const eventWidthA = columnWidth - countText.length - downArrow.length
  const location = getPluginLocation({ package, configPath })

  logMessage(
    `${THEME.header(`┌─${line}─┐`)}
${THEME.header(`│ ${countText}${event.padEnd(eventWidthA)}${downArrow} │`)} ${location}
${THEME.header(`└─${line}─┘ `)}`,
  )
}

const getPluginLocation = function({ package, configPath }) {
  if (package === undefined) {
    return getBuildCommandDescription(configPath)
  }

  return `Plugin ${THEME.highlightWords(package)}`
}

const getDryColumnWidth = function(eventWidth, commandsCount) {
  const symbolsWidth = `${commandsCount}`.length + 4
  return Math.max(eventWidth + symbolsWidth, DRY_HEADER_NAMES[1].length)
}

const DRY_HEADER_NAMES = ['Event', 'Location']

const logDryRunEnd = function() {
  logMessage(`\nIf this looks good to you, run \`netlify build\` to execute the build\n`)
}

const logCommand = function({ event, package, index, configPath, error }) {
  const description = getCommandDescription({ event, package, configPath })
  const logHeaderFunc = error ? logErrorHeader : logHeader
  logHeaderFunc(`${index}. ${description}`)
  logMessage('')
}

const logBuildCommandStart = function(buildCommand) {
  log(THEME.highlightWords(`$ ${buildCommand}`))
}

const logCommandSuccess = function() {
  logMessage('')
}

const logTimer = function(durationMs, timerName) {
  const duration = prettyMs(durationMs)
  log(THEME.dimWords(`(${timerName} completed in ${duration})`))
}

const logCacheDir = function(path) {
  logMessage(`Caching ${path}`)
}

const logPluginError = function(error) {
  const { header, body } = serializeError(error)
  logErrorHeader(header)
  logMessage(`\n${body}`)
}

const logBuildError = function(error) {
  const { header, body, isSuccess } = serializeError(error)
  const logFunction = isSuccess ? logHeader : logErrorHeader
  logFunction(header)
  logMessage(`\n${body}\n`)
}

const logBuildSuccess = function() {
  logHeader('Netlify Build Complete')
  logMessage('')
}

module.exports = {
  logBuildStart,
  logFlags,
  logBuildDir,
  logConfigPath,
  logConfig,
  logContext,
  logInstallMissingPlugins,
  logInstallLocalPluginsDeps,
  logInstallFunctionDependencies,
  logDeprecatedFunctionsInstall,
  logLoadedPlugins,
  logDryRunStart,
  logDryRunCommand,
  logDryRunEnd,
  logCommand,
  logBuildCommandStart,
  logCommandSuccess,
  logTimer,
  logCacheDir,
  logPluginError,
  logBuildError,
  logBuildSuccess,
}
