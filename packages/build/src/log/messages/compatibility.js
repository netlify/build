import semver from 'semver'

import { isPreviousMajor } from '../../utils/semver.js'
import { getPluginOrigin } from '../description.js'
import { logArray, logSubHeader, logWarningArray, logWarningSubHeader } from '../logger.js'
import { THEME } from '../theme.js'

export const logRuntime = (logs, pluginOptions) => {
  logMessage(logs, 'DEBUG logRuntime')
  logObject(logs, pluginsOptions)

  const runtimes = pluginOptions.filter(isRuntime)

  // Once we have more runtimes, this hardcoded check should be removed
  if (runtimes.length > 1) {
    const [nextRuntime] = runtimes

    logSubHeader(logs, `Using Next.js Runtime - v${nextRuntime.pluginPackageJson.version}`)
  }
}

export const logLoadingPlugins = function (logs, pluginsOptions, debug) {
  logMessage(logs, 'DEBUG logLoadingPlugins')
  logObject(logs, pluginsOptions)
  const loadingPlugins = pluginsOptions
    .filter(isNotCorePlugin)
    // We don't want to show runtimes as plugins
    .filter((plugin) => !isRuntime(plugin))
    .map((pluginOptions) => getPluginDescription(pluginOptions, debug))

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

const isRuntime = function ({ packageName }) {
  // Make this a bit more robust in the future
  return ['@netlify/next-runtime', '@netlify/plugin-nextjs'].includes(packageName)
}

const getPluginDescription = function (
  {
    packageName,
    pluginPackageJson: { version },
    loadedFrom,
    origin,
    pinnedVersion,
    latestVersion,
    expectedVersion,
    compatibleVersion,
  },
  debug,
) {
  const versionedPackage = getVersionedPackage(packageName, version)
  const pluginOrigin = getPluginOrigin(loadedFrom, origin)
  const description = `${THEME.highlightWords(packageName)}${versionedPackage} ${pluginOrigin}`
  if (!debug) {
    return description
  }

  const versions = Object.entries({
    pinned: pinnedVersion,
    latest: latestVersion,
    expected: expectedVersion,
    compatible: compatibleVersion,
  })
    .filter(hasVersion)
    .map(getVersionField)

  if (versions.length === 0) {
    return description
  }

  return `${description} (${versions.join(', ')})`
}

const hasVersion = function ([, version]) {
  return version !== undefined
}

const getVersionField = function ([versionFieldName, version]) {
  return `${versionFieldName} ${version}`
}

// Print a warning message when old versions plugins are used.
// This can only happen when they are installed to `package.json`.
export const logOutdatedPlugins = function (logs, pluginsOptions) {
  const outdatedPlugins = pluginsOptions.filter(hasOutdatedVersion).map(getOutdatedPlugin)

  if (outdatedPlugins.length === 0) {
    return
  }

  logWarningSubHeader(logs, 'Outdated plugins')
  logWarningArray(logs, outdatedPlugins)
}

const hasOutdatedVersion = function ({ pluginPackageJson: { version }, latestVersion }) {
  return version !== undefined && latestVersion !== undefined && semver.lt(version, latestVersion)
}

const getOutdatedPlugin = function ({
  packageName,
  pluginPackageJson: { version },
  latestVersion,
  migrationGuide,
  loadedFrom,
  origin,
}) {
  const versionedPackage = getVersionedPackage(packageName, version)
  const outdatedDescription = getOutdatedDescription({ latestVersion, migrationGuide, loadedFrom, origin })
  return `${THEME.warningHighlightWords(packageName)}${versionedPackage}: ${outdatedDescription}`
}

const getOutdatedDescription = function ({ latestVersion, migrationGuide, loadedFrom, origin }) {
  const upgradeInstruction = getUpgradeInstruction(loadedFrom, origin)
  if (migrationGuide === undefined) {
    return `latest version is ${latestVersion}\n${upgradeInstruction}`
  }

  return `latest version is ${latestVersion}\nMigration guide: ${migrationGuide}\n${upgradeInstruction}`
}

const getUpgradeInstruction = function (loadedFrom, origin) {
  if (loadedFrom === 'package.json') {
    return 'To upgrade this plugin, please update its version in "package.json"'
  }

  if (origin === 'ui') {
    return 'To upgrade this plugin, please uninstall and re-install it from the Netlify plugins directory (https://app.netlify.com/plugins)'
  }

  return 'To upgrade this plugin, please remove it from "netlify.toml" and install it from the Netlify plugins directory instead (https://app.netlify.com/plugins)'
}

// Print a warning message when plugins are using a version that is too recent
// and does not meet some `compatibility` expectations.
// This can only happen when they are installed to `package.json`.
export const logIncompatiblePlugins = function (logs, pluginsOptions) {
  const incompatiblePlugins = pluginsOptions.filter(hasIncompatibleVersion).map(getIncompatiblePlugin)

  if (incompatiblePlugins.length === 0) {
    return
  }

  logWarningSubHeader(logs, 'Incompatible plugins')
  logWarningArray(logs, incompatiblePlugins)
}

const hasIncompatibleVersion = function ({ pluginPackageJson: { version }, compatibleVersion, compatWarning }) {
  return (
    compatWarning !== '' &&
    version !== undefined &&
    compatibleVersion !== undefined &&
    // Using only the major version prevents printing this warning message when
    // a site is using the right `compatibility` version, but is using the most
    // recent version due to the time gap between `npm publish` and the
    // `plugins.json` update
    isPreviousMajor(compatibleVersion, version)
  )
}

const getIncompatiblePlugin = function ({
  packageName,
  pluginPackageJson: { version },
  compatibleVersion,
  compatWarning,
}) {
  const versionedPackage = getVersionedPackage(packageName, version)
  return `${THEME.warningHighlightWords(
    packageName,
  )}${versionedPackage}: version ${compatibleVersion} is the most recent version compatible with ${compatWarning}`
}

// Make sure we handle `package.json` with `version` being either `undefined`
// or an empty string
const getVersionedPackage = function (packageName, version = '') {
  return version === '' ? '' : `@${version}`
}
