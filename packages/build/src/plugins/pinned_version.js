import { handleBuildError } from '../error/handle.js'
import { getMajorVersion } from '../utils/semver.js'

// Retrieve plugin's pinned major versions by fetching the latest `PluginRun`
// Only applies to `netlify.toml`-only installed plugins.
export const addPinnedVersions = async function ({ pluginsOptions, api, siteInfo: { id: siteId }, sendStatus }) {
  if (!sendStatus || api === undefined || !siteId) {
    return pluginsOptions
  }

  const packages = pluginsOptions.filter(shouldFetchPinVersion).map(getPackageName)
  if (packages.length === 0) {
    return pluginsOptions
  }

  const pluginRuns = await api.getLatestPluginRuns({ site_id: siteId, packages, state: 'success' })
  const pluginsOptionsA = pluginsOptions.map((pluginOption) => addPinnedVersion(pluginOption, pluginRuns))
  return pluginsOptionsA
}

const shouldFetchPinVersion = function ({ pinnedVersion, loadedFrom, origin }) {
  return pinnedVersion === undefined && loadedFrom === 'auto_install' && origin === 'config'
}

const getPackageName = function ({ packageName }) {
  return packageName
}

const addPinnedVersion = function (pluginOptions, pluginRuns) {
  const foundPluginRun = pluginRuns.find((pluginRun) => pluginRun.package === pluginOptions.packageName)
  if (foundPluginRun === undefined) {
    return pluginOptions
  }

  const pinnedVersion = getMajorVersion(foundPluginRun.version)
  return pinnedVersion === undefined ? pluginOptions : { ...pluginOptions, pinnedVersion }
}

// Send an API request to pin plugins' major versions.
// Only applies to UI-installed plugins.
export const pinPlugins = async function ({
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
//  - the plugin was installed in the UI
//  - both the build and the plugin succeeded
const shouldPinVersion = function ({
  pluginOptions: { packageName, pinnedVersion, loadedFrom, origin },
  failedPlugins,
}) {
  return (
    pinnedVersion === undefined &&
    loadedFrom === 'auto_install' &&
    origin === 'ui' &&
    !failedPlugins.includes(packageName)
  )
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
  const pinnedVersion = getMajorVersion(version)
  try {
    await api.updatePlugin({
      package: encodeURIComponent(packageName),
      site_id: siteId,
      body: { pinned_version: pinnedVersion },
    })
    // Bitballoon API randomly fails with 502.
    // Builds should be successful when this API call fails, but we still want
    // to report the error both in logs and in error monitoring.
  } catch (error) {
    if (shouldIgnoreError(error)) {
      return
    }

    await handleBuildError(error, { errorMonitor, netlifyConfig, childEnv, mode, logs, debug, testOpts })
  }
}

// Status is 404 if the plugin is uninstalled while the build is ongoing.
const shouldIgnoreError = function ({ status }) {
  return status === 404
}
