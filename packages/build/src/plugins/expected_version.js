'use strict'

const { addErrorInfo } = require('../error/info')
const { resolvePath } = require('../utils/resolve')

const { getExpectedVersion } = require('./compatibility')
const { getPluginsList } = require('./list')

// When using plugins in our official list, those are installed in .netlify/plugins/
// We ensure that the last version that's been approved is always the one being used.
// We also ensure that the plugin is our official list.
const addExpectedVersions = async function ({ pluginsOptions, autoPluginsDir, packageJson, debug, logs, testOpts }) {
  if (!pluginsOptions.some(needsExpectedVersion)) {
    return pluginsOptions
  }

  const pluginsList = await getPluginsList({ debug, logs, testOpts })
  return await Promise.all(
    pluginsOptions.map((pluginOptions) =>
      addExpectedVersion({ pluginsList, autoPluginsDir, packageJson, pluginOptions }),
    ),
  )
}

// Any `pluginOptions` with `expectedVersion` set will be automatically installed
const addExpectedVersion = async function ({
  pluginsList,
  autoPluginsDir,
  packageJson,
  pluginOptions,
  pluginOptions: { packageName, pluginPath, loadedFrom, nodeVersion },
}) {
  if (!needsExpectedVersion(pluginOptions)) {
    return pluginOptions
  }

  if (pluginsList[packageName] === undefined) {
    validateUnlistedPlugin(packageName, loadedFrom)
    return pluginOptions
  }

  const { version: latestVersion, compatibility } = pluginsList[packageName]

  const { expectedVersion, compatWarning } = getExpectedVersion({
    latestVersion,
    compatibility,
    nodeVersion,
    packageJson,
  })

  // Plugin was not previously installed
  if (pluginPath === undefined) {
    return { ...pluginOptions, latestVersion, expectedVersion, compatWarning }
  }

  const packageJsonPath = await resolvePath(`${packageName}/package.json`, autoPluginsDir)
  // eslint-disable-next-line node/global-require, import/no-dynamic-require
  const { version } = require(packageJsonPath)

  // Plugin was previously installed but a new version is available
  if (version !== expectedVersion) {
    return { ...pluginOptions, latestVersion, expectedVersion, compatWarning }
  }

  return { ...pluginOptions, latestVersion }
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
