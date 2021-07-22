'use strict'

const { satisfies } = require('semver')

const { addErrorInfo } = require('../error/info')
const { resolvePath } = require('../utils/resolve')

const { getExpectedVersion } = require('./compatibility')
const { getPluginsList } = require('./list')

// When using plugins in our official list, those are installed in .netlify/plugins/
// We ensure that the last version that's been approved is always the one being used.
// We also ensure that the plugin is our official list.
const addExpectedVersions = async function ({
  pluginsOptions,
  autoPluginsDir,
  packageJson,
  debug,
  logs,
  buildDir,
  testOpts,
}) {
  if (!pluginsOptions.some(needsExpectedVersion)) {
    return pluginsOptions
  }

  const pluginsList = await getPluginsList({ debug, logs, testOpts })
  return await Promise.all(
    pluginsOptions.map((pluginOptions) =>
      addExpectedVersion({ pluginsList, autoPluginsDir, packageJson, pluginOptions, buildDir }),
    ),
  )
}

// Any `pluginOptions` with `expectedVersion` set will be automatically installed
const addExpectedVersion = async function ({
  pluginsList,
  autoPluginsDir,
  packageJson,
  pluginOptions,
  pluginOptions: { packageName, pluginPath, loadedFrom, nodeVersion, pinnedVersion },
  buildDir,
}) {
  if (!needsExpectedVersion(pluginOptions)) {
    return pluginOptions
  }

  if (pluginsList[packageName] === undefined) {
    validateUnlistedPlugin(packageName, loadedFrom)
    return pluginOptions
  }

  const versions = pluginsList[packageName]
  const [{ version: latestVersion, migrationGuide }] = versions
  const [{ version: expectedVersion }, { version: compatibleVersion, compatWarning }] = await Promise.all([
    getExpectedVersion({ versions, nodeVersion, packageJson, buildDir, pinnedVersion }),
    getExpectedVersion({ versions, nodeVersion, packageJson, buildDir }),
  ])

  const isMissing = await isMissingVersion({ autoPluginsDir, packageName, pluginPath, loadedFrom, expectedVersion })
  return {
    ...pluginOptions,
    latestVersion,
    expectedVersion,
    compatibleVersion,
    migrationGuide,
    compatWarning,
    isMissing,
  }
}

// Checks whether plugin should be installed due to the wrong version being used
// (either outdated, or mismatching compatibility requirements)
const isMissingVersion = async function ({ autoPluginsDir, packageName, pluginPath, loadedFrom, expectedVersion }) {
  return (
    // We always respect the versions specified in `package.json`, as opposed
    // to auto-installed plugins
    loadedFrom !== 'package.json' &&
    // Plugin was not previously installed
    (pluginPath === undefined ||
      // Plugin was previously installed but a different version should be used
      !satisfies(await getAutoPluginVersion(packageName, autoPluginsDir), expectedVersion))
  )
}

const getAutoPluginVersion = async function (packageName, autoPluginsDir) {
  const packageJsonPath = await resolvePath(`${packageName}/package.json`, autoPluginsDir)
  // eslint-disable-next-line node/global-require, import/no-dynamic-require
  const { version } = require(packageJsonPath)
  return version
}

const needsExpectedVersion = function ({ loadedFrom }) {
  return loadedFrom === 'auto_install' || loadedFrom === 'package.json'
}

// Plugins that are not in our official list can only be specified in
// `netlify.toml` providing they are also installed in the site's package.json.
// Otherwise, the build should fail.
const validateUnlistedPlugin = function (packageName, loadedFrom) {
  if (loadedFrom === 'package.json') {
    return
  }

  const error = new Error(
    `Plugins must be installed either in the Netlify App or in "package.json".
Please run "npm install -D ${packageName}" or "yarn add -D ${packageName}".`,
  )
  addErrorInfo(error, { type: 'resolveConfig' })
  throw error
}

module.exports = { addExpectedVersions }
