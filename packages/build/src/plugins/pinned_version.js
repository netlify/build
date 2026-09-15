import { trace, context } from '@opentelemetry/api'
import { wrapTracer } from '@opentelemetry/api/experimental'

import { handleBuildError } from '../error/handle.js'
import { addBuildErrorToActiveSpan } from '../tracing/main.js'
import { getMajorVersion, isPrerelease } from '../utils/semver.js'

const tracer = wrapTracer(trace.getTracer('plugins'))

// Retrieve plugin's pinned major versions by fetching the latest `PluginRun`
// Only applies to `netlify.toml`-only installed plugins.
export const addPinnedVersions = async function ({ pluginsOptions, api, siteInfo: { id: siteId }, sendStatus }) {
  if (!sendStatus || api === undefined || !siteId) {
    return pluginsOptions
  }

  return await tracer.startActiveSpan('add-pinned-version', async (span) => {
    const packages = pluginsOptions.filter(shouldFetchPinVersion).map(getPackageName)
    if (packages.length === 0) {
      return pluginsOptions
    }
    span.addAttributes({
      'build.plugins.pinned_versions.packages': packages.join(','),
    })

    const pluginRuns = await api.getLatestPluginRuns({ site_id: siteId, packages, state: 'success' })
    const pluginsOptionsA = pluginsOptions.map((pluginOption) => addPinnedVersion(pluginOption, pluginRuns))
    span.end()

    return pluginsOptionsA
  })
}

const shouldFetchPinVersion = function ({ pinnedVersion, loadedFrom, origin }) {
  return pinnedVersion === undefined && loadedFrom === 'auto_install' && origin === 'config'
}

const getPackageName = function ({ packageName }) {
  return packageName
}

const addPinnedVersion = function (pluginOptions, pluginRuns) {
  const { packageName } = pluginOptions
  const foundPluginRun = pluginRuns.find((pluginRun) => pluginRun.package === packageName)
  if (foundPluginRun === undefined) {
    return pluginOptions
  }

  const pinnedVersion = getMajorVersion(foundPluginRun.version)
  const span = trace.getActiveSpan()
  span.addAttributes({
    [`build.plugins.pinned_versions.${packageName}`]: pinnedVersion,
  })

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

  return await tracer.startActiveSpan('pin-plugins', async (span) => {
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
    span.end()
  })
}

// Only pin version if:
//  - the plugin's version has not been pinned yet
//  - the plugin was installed in the UI
//  - both the build and the plugin succeeded
const shouldPinVersion = function ({
  pluginOptions: {
    packageName,
    pinnedVersion,
    pluginPackageJson: { version },
    loadedFrom,
    origin,
  },
  failedPlugins,
}) {
  return (
    !isPrerelease(version) &&
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
  return await tracer.startActiveSpan(`pin-plugin-${packageName}`, async (span) => {
    const pinnedVersion = getMajorVersion(version)
    try {
      span.addAttributes({
        [`build.plugins.pin_version.${packageName}`]: pinnedVersion,
      })
      await api.updatePlugin({
        package: encodeURIComponent(packageName),
        site_id: siteId,
        body: { pinned_version: pinnedVersion },
      })
      // Bitballoon API randomly fails with 502.
      // Builds should be successful when this API call fails, but we still want
      // to report the error both in logs and in error monitoring.
    } catch (error) {
      addBuildErrorToActiveSpan(error)
      if (shouldIgnoreError(error)) {
        return
      }

      await handleBuildError(error, { errorMonitor, netlifyConfig, childEnv, mode, logs, debug, testOpts })
    } finally {
      span.end()
    }
  })
}

// Status is 404 if the plugin is uninstalled while the build is ongoing.
const shouldIgnoreError = function ({ status }) {
  return status === 404
}
