'use strict'

const { addErrorInfo } = require('../error/info')
const { resolvePath } = require('../utils/resolve')

const { getPluginsList } = require('./list')

// When using plugins in our official list, those are installed in .netlify/plugins/
// We ensure that the last version that's been approved is always the one being used.
// We also ensure that the plugin is our official list.
const addExpectedVersions = async function ({ pluginsOptions, autoPluginsDir, debug, logs, testOpts }) {
  if (!pluginsOptions.some(isAutoPlugin)) {
    return pluginsOptions
  }

  const pluginsList = await getPluginsList({ debug, logs, testOpts })
  return await Promise.all(
    pluginsOptions.map((pluginOptions) => addExpectedVersion({ pluginsList, autoPluginsDir, pluginOptions })),
  )
}

// Any `pluginOptions` with `expectedVersion` set will be automatically installed
const addExpectedVersion = async function ({
  pluginsList,
  autoPluginsDir,
  pluginOptions,
  pluginOptions: { packageName, pluginPath, loadedFrom },
}) {
  if (!isAutoPlugin({ loadedFrom })) {
    return pluginOptions
  }

  const expectedVersion = pluginsList[packageName]

  validateUnlistedPlugin(expectedVersion, packageName)

  // Plugin was not previously installed
  if (pluginPath === undefined) {
    return { ...pluginOptions, expectedVersion }
  }

  const packageJsonPath = await resolvePath(`${packageName}/package.json`, autoPluginsDir)
  // eslint-disable-next-line node/global-require, import/no-dynamic-require
  const { version } = require(packageJsonPath)

  // Plugin was previously installed but a new version is available
  if (version !== expectedVersion) {
    return { ...pluginOptions, expectedVersion }
  }

  return pluginOptions
}

const isAutoPlugin = function ({ loadedFrom }) {
  return loadedFrom === 'auto_install'
}

// Plugins that are not in our official list can only be specified in
// `netlify.toml` providing they are also installed in the site's package.json.
// Otherwise, the build should fail.
const validateUnlistedPlugin = function (expectedVersion, packageName) {
  if (expectedVersion !== undefined) {
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
