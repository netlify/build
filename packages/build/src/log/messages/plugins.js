'use strict'

const { lt: ltVersion, major } = require('semver')

const { getPluginOrigin } = require('../description')
const { log, logArray, logErrorArray, logError, logSubHeader, logErrorSubHeader } = require('../logger')
const { THEME } = require('../theme')

const logPluginsFetchError = function (logs, message) {
  logError(
    logs,
    `
Warning: could not fetch latest plugins list. Plugins versions might not be the latest.
${message}`,
  )
}

const logPluginsList = function ({ pluginsList, debug, logs }) {
  if (!debug) {
    return
  }

  // eslint-disable-next-line fp/no-mutating-methods
  const pluginsListArray = Object.entries(pluginsList).map(getPluginsListItem).sort()

  logSubHeader(logs, 'Available plugins')
  logArray(logs, pluginsListArray)
}

const getPluginsListItem = function ([packageName, { version }]) {
  return `${packageName}@${version}`
}

const logLoadingPlugins = function (logs, pluginsOptions) {
  const loadingPlugins = pluginsOptions.filter(isNotCorePlugin).map(getPluginDescription)

  if (loadingPlugins.length === 0) {
    return
  }

  logSubHeader(logs, 'Loading plugins')
  logArray(logs, loadingPlugins)
}

// We only logs plugins explicitly enabled by users
const isNotCorePlugin = function ({ origin }) {
  return origin !== 'core'
}

const getPluginDescription = function ({ packageName, pluginPackageJson: { version }, loadedFrom, origin }) {
  const versionedPackage = getVersionedPackage(packageName, version)
  const pluginOrigin = getPluginOrigin(loadedFrom, origin)
  return `${THEME.highlightWords(packageName)}${versionedPackage} ${pluginOrigin}`
}

// Print a warning message when old versions plugins are used.
// This can only happen when they are installed to `package.json`.
const logOutdatedPlugins = function (logs, pluginsOptions) {
  const outdatedPlugins = pluginsOptions.map(getOutdatedPlugin).filter(Boolean)

  if (outdatedPlugins.length === 0) {
    return
  }

  logErrorSubHeader(logs, 'Outdated plugins')
  logErrorArray(logs, outdatedPlugins)
}

const getOutdatedPlugin = function ({ packageName, pluginPackageJson: { version }, latestVersion, compatWarning }) {
  if (!hasOutdatedVersion(version, latestVersion)) {
    return
  }

  const versionedPackage = getVersionedPackage(packageName, version)
  const outdatedDescription = getOutdatedDescription(latestVersion, compatWarning)
  return `${THEME.errorHighlightWords(packageName)}${versionedPackage}: ${outdatedDescription}`
}

const hasOutdatedVersion = function (version, latestVersion) {
  return version !== undefined && latestVersion !== undefined && ltVersion(version, latestVersion)
}

const getOutdatedDescription = function (latestVersion, compatWarning) {
  if (compatWarning === undefined) {
    return `latest version is ${latestVersion}`
  }

  return `latest version is ${latestVersion} which is incompatible with ${compatWarning}`
}

// Print a warning message when plugins are using a version that is too recent
// and does not meet some `compatibility` expectations.
// This can only happen when they are installed to `package.json`.
const logIncompatiblePlugins = function (logs, pluginsOptions) {
  const incompatiblePlugins = pluginsOptions.map(getIncompatiblePlugin).filter(Boolean)

  if (incompatiblePlugins.length === 0) {
    return
  }

  logErrorSubHeader(logs, 'Incompatible plugins')
  logErrorArray(logs, incompatiblePlugins)
}

const getIncompatiblePlugin = function ({
  packageName,
  pluginPackageJson: { version },
  expectedVersion,
  compatWarning,
}) {
  if (!hasIncompatibleVersion(version, expectedVersion, compatWarning)) {
    return
  }

  const versionedPackage = getVersionedPackage(packageName, version)
  return `${THEME.errorHighlightWords(
    packageName,
  )}${versionedPackage}: expected version ${expectedVersion} which is the last version compatible with ${compatWarning}`
}

const hasIncompatibleVersion = function (version, expectedVersion, compatWarning) {
  return (
    compatWarning !== undefined &&
    version !== undefined &&
    expectedVersion !== undefined &&
    // Using only the major version prevents printing this warning message when
    // a site is using the right `compatibility` version, but is using the most
    // recent version due to the time gap between `npm publish` and the
    // `plugins.json` update
    major(expectedVersion) < major(version)
  )
}

// Make sure we handle `package.json` with `version` being either `undefined`
// or an empty string
const getVersionedPackage = function (packageName, version = '') {
  return version === '' ? '' : `@${version}`
}

const logFailPluginWarning = function (methodName, event) {
  logError(
    undefined,
    `Plugin error: since "${event}" happens after deploy, the build has already succeeded and cannot fail anymore. This plugin should either:
- use utils.build.failPlugin() instead of utils.build.${methodName}() to clarify that the plugin failed, but not the build.
- use "onPostBuild" instead of "${event}" if the plugin failure should make the build fail too. Please note that "onPostBuild" (unlike "${event}") happens before deploy.`,
  )
}

const logDeploySuccess = function (logs) {
  log(logs, 'Site deploy was successfully initiated')
}

module.exports = {
  logPluginsFetchError,
  logPluginsList,
  logLoadingPlugins,
  logOutdatedPlugins,
  logIncompatiblePlugins,
  logFailPluginWarning,
  logDeploySuccess,
}
