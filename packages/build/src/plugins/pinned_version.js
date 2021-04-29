'use strict'

const { major } = require('semver')

const { handleBuildError } = require('../error/handle')

// Send an API request to pin plugins' major versions
// eslint-disable-next-line complexity
const pinPlugins = async function ({
  pluginsOptions,
  failedPlugins,
  api,
  siteInfo: { id: siteId },
  childEnv,
  mode,
  netlifyConfig,
  errorMonitor,
  logs,
  debug,
  testOpts,
  sendStatus,
}) {
  // @todo remove this after the API bug with `updateSite` is fixed
  if (mode !== 'require' && siteId !== 'test') {
    return
  }

  if ((mode !== 'buildbot' && !sendStatus) || api === undefined || !siteId) {
    return
  }

  const pluginsOptionsA = pluginsOptions.filter((pluginOptions) => shouldPinVersion({ pluginOptions, failedPlugins }))
  await Promise.all(
    pluginsOptionsA.map((pluginOptions) =>
      pinPlugin({
        pluginOptions,
        api,
        childEnv,
        mode,
        netlifyConfig,
        errorMonitor,
        logs,
        debug,
        testOpts,
        siteId,
      }),
    ),
  )
}

// Only pin version if:
//  - the plugin's version has not been pinned yet
//  - the plugin was installed in the UI or in `netlify.toml` (not `package.json`)
//  - both the build and the plugin succeeded
const shouldPinVersion = function ({ pluginOptions: { packageName, pinnedVersion, loadedFrom }, failedPlugins }) {
  return pinnedVersion === undefined && loadedFrom === 'auto_install' && !failedPlugins.includes(packageName)
}

const pinPlugin = async function ({
  pluginOptions: {
    packageName,
    pluginPackageJson: { version },
  },
  api,
  childEnv,
  mode,
  netlifyConfig,
  errorMonitor,
  logs,
  debug,
  testOpts,
  siteId,
}) {
  const pinnedVersion = String(major(version))
  try {
    await api.updatePlugin({ package: packageName, site_id: siteId, body: { pinned_version: pinnedVersion } })
    // Bitballoon API randomly fails with 502.
    // Builds should be successful when this API call fails, but we still want
    // to report the error both in logs and in error monitoring.
  } catch (error) {
    await handleBuildError(error, { errorMonitor, netlifyConfig, childEnv, mode, logs, debug, testOpts })
  }
}

module.exports = { pinPlugins }
