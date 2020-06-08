const { arrowDown } = require('figures')
const filterObj = require('filter-obj')
const prettyMs = require('pretty-ms')

const { name, version } = require('../../package.json')
const { isSuccessException } = require('../error/cancel')
const { serializeLogError } = require('../error/parse/serialize_log')
const { omit } = require('../utils/omit')
const { removeFalsy } = require('../utils/remove_falsy')

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

const HIDDEN_FLAGS = [
  'token',
  'deployId',
  'cachedConfig',
  'defaultConfig',
  'debug',
  'env',
  'bugsnagKey',
  'testOpts',
  'telemetry',
]

const logBuildDir = function(buildDir) {
  logSubHeader('Current directory')
  logMessage(buildDir)
}

const logConfigPath = function(configPath = NO_CONFIG_MESSAGE) {
  logSubHeader('Config file')
  logMessage(configPath)
}

const NO_CONFIG_MESSAGE = 'No config file was defined: using default values.'

const logConfig = function({ netlifyConfig, debug }) {
  if (!debug) {
    return
  }

  logSubHeader('Resolved config')
  logObject(simplifyConfig(netlifyConfig))
}

const logConfigOnError = function(error, netlifyConfig) {
  if (netlifyConfig === undefined || isSuccessException(error)) {
    return
  }

  logMessage(THEME.errorSubHeader('Resolved config'))
  logObject(simplifyConfig(keepPublicProperties(netlifyConfig)))
}

// Make sure we are not printing secret values. Use an allow list.
const keepPublicProperties = function({
  build: { base, command, functions, ignore, processing, publish },
  headers,
  plugins,
  redirects,
}) {
  const pluginsA = plugins.map(keepPluginPublicProperties)
  return {
    build: { base, command, functions, ignore, processing, publish },
    headers,
    plugins: pluginsA,
    redirects,
  }
}

const keepPluginPublicProperties = function({ package, origin, inputs }) {
  const inputsA = filterObj(inputs, isPublicInput)
  return { package, origin, inputs: inputsA }
}

const isPublicInput = function(key, input) {
  return typeof input === 'boolean'
}

// The resolved configuration gets assigned some default values (empty objects and arrays)
// to make it more convenient to use without checking for `undefined`.
// However those empty values are not useful to users, so we don't log them.
const simplifyConfig = function({ build: { environment = {}, ...build }, plugins, ...netlifyConfig }) {
  const environmentA = omit(environment, BUILDBOT_ENVIRONMENT)
  const simplifiedBuild = removeFalsy({
    ...build,
    ...removeEmptyObject(environmentA, 'environment'),
  })
  return removeFalsy({
    ...netlifyConfig,
    ...removeEmptyObject(simplifiedBuild, 'build'),
    ...removeEmptyArray(plugins, 'plugins'),
  })
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

const logMissingPluginsWarning = function(packages) {
  logErrorSubHeader('Missing plugins')
  logMessage(
    THEME.errorSubHeader(
      `The following plugins should be installed either via the Netlify app or as a "dependency" inside your project's "package.json"`,
    ),
  )
  logArray(packages, { color: THEME.errorSubHeader })
}

const logInstallLocalPluginsDeps = function(localPluginsOptions) {
  const packages = localPluginsOptions.map(getPackage)
  logSubHeader('Installing local plugins dependencies')
  logArray(packages)
}

const logInstallFunctionDependencies = function() {
  log('Installing functions dependencies')
}

const getPackage = function({ package }) {
  return package
}

const logLoadingPlugins = function(pluginsOptions) {
  const loadingPlugins = pluginsOptions.map(getPluginDescription)

  if (loadingPlugins.length === 0) {
    return
  }

  logSubHeader('Loading plugins')
  logArray(loadingPlugins)
}

const getPluginDescription = function({ package, packageJson: { version }, loadedFrom, origin }) {
  const versionA = version === undefined ? '' : `@${version}`
  const pluginOrigin = getPluginOrigin(loadedFrom, origin)
  return `${THEME.highlightWords(package)}${versionA} ${pluginOrigin}`
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
  const fullName = getPluginFullName({ package, configPath })

  logMessage(
    `${THEME.header(`┌─${line}─┐`)}
${THEME.header(`│ ${countText}${event.padEnd(eventWidthA)}${downArrow} │`)} ${fullName}
${THEME.header(`└─${line}─┘ `)}`,
  )
}

const getPluginFullName = function({ package, configPath }) {
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
  const logHeaderFunc = error && !isSuccessException(error) ? logErrorHeader : logHeader
  logHeaderFunc(`${index + 1}. ${description}`)
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

const logStatuses = function(statuses) {
  logHeader('Summary')
  statuses.forEach(logStatus)
}

const logStatus = function({ package, title = `Plugin ${package} ran successfully`, summary, text }) {
  const titleA = title.includes(package) ? title : `${package}: ${title}`
  const body = text === undefined ? summary : `${summary}\n${THEME.dimWords(text)}`
  logSubHeader(titleA)
  logMessage(body)
}

const logCacheDir = function(path) {
  logMessage(`Caching ${path}`)
}

const logBuildError = function(error, netlifyConfigArg) {
  const { title, body, isSuccess, netlifyConfig = netlifyConfigArg } = serializeLogError(error)
  const logFunction = isSuccess ? logHeader : logErrorHeader
  logFunction(title)
  logMessage(`\n${body}\n`)
  logConfigOnError(error, netlifyConfig)
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
  logCacheDir,
  logBuildError,
  logBuildSuccess,
}
