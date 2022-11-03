import semver from 'semver'

import { addErrorInfo } from '../../error/info.js'
import { isRuntime } from '../../utils/runtime.js'
import { isPreviousMajor } from '../../utils/semver.js'
import { getPluginOrigin } from '../description.js'
import {
  logArray,
  logErrorArray,
  logErrorHeader,
  logSubHeader,
  logWarningArray,
  logWarningSubHeader,
} from '../logger.js'
import { THEME } from '../theme.js'

export const logRuntime = (logs, pluginOptions) => {
  const runtimes = pluginOptions.filter(isRuntime)

  // Once we have more runtimes, this hardcoded check should be removed
  if (runtimes.length !== 0) {
    const [nextRuntime] = runtimes

    logSubHeader(logs, `Using Next.js Runtime - v${nextRuntime.pluginPackageJson.version}`)
  }
}

export const logLoadingPlugins = function (logs, pluginsOptions, debug) {
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

const getOutdatedDescription = function ({
  latestVersion,
  migrationGuide,
  loadedFrom,
  origin,
  excludedVersionsRange,
  version,
  packageName,
}) {
  const upgradeInstruction = getUpgradeInstruction(
    loadedFrom,
    origin,
    excludedVersionsRange,
    latestVersion,
    version,
    packageName,
  )
  if (excludedVersionsRange !== undefined || migrationGuide === undefined) {
    return `latest version is ${latestVersion}\n${upgradeInstruction}`
  }

  return `latest version is ${latestVersion}\nMigration guide: ${migrationGuide}\n${upgradeInstruction}`
}

const getUpgradeInstruction = function (
  loadedFrom,
  origin,
  excludedVersionsRange,
  latestVersion,
  version,
  packageName,
) {
  if (excludedVersionsRange !== undefined) {
    return `We have blocked this build due to likely failure of this version of nextjs-runtime: ${packageName}${version}.
Versions greater than 4.26.0 are recommended. To upgrade this plugin, please update its version in "package.json"
to the latest version: ${latestVersion} or version above 4.26.0. If you cannot use a more recent version,
please contact support at https://www.netlify.com/support for guidance.`
  }

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

// Print an error message when unsupported versions of plugins are used.
// This can only happen when they are installed to `package.json`.
export const logUnsupportedPluginVersions = function (logs, pluginsOptions) {
  const unsupportedVersions = pluginsOptions.filter(hasUnsupportedVersion).map(getExcludedVersion)
  if (unsupportedVersions.length === 0) {
    return
  }

  logErrorHeader(logs, 'Unsupported plugin version(s)')
  logErrorArray(logs, unsupportedVersions)

  const error = new Error('Unsupported plugin version(s) detected')
  addErrorInfo(error, { type: 'pluginUnsupportedVersion' })
  throw error
}

const hasUnsupportedVersion = function ({ pluginPackageJson: { version }, manifest: { excludedVersionsRange } }) {
  // https://github.com/npm/node-semver#hyphen-ranges-xyz---abc
  // excludedVersionsRange is a range of versions that are not supported e.g 4.0.0 - 4.25.0
  // semver hyphen range is inclusive 4.0.0 - 4.25.0 is same as >= 4.0.0 || < 4.26.0;
  return (
    version !== undefined && excludedVersionsRange !== undefined && semver.satisfies(version, excludedVersionsRange)
  )
}

const getExcludedVersion = function ({
  packageName,
  pluginPackageJson: { version },
  latestVersion,
  migrationGuide,
  loadedFrom,
  origin,
  manifest: { excludedVersionsRange },
}) {
  const versionedPackage = getVersionedPackage(packageName, version)
  const outdatedDescription = getOutdatedDescription({
    latestVersion,
    migrationGuide,
    loadedFrom,
    origin,
    excludedVersionsRange,
    version,
    packageName,
  })
  return `${THEME.errorHighlightWords(packageName)}${versionedPackage} ${outdatedDescription}`
}
