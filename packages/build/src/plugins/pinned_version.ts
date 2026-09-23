import type { PackageJson } from 'read-package-up'

import type { ErrorParam } from '../core/types.js'
import { handleBuildError } from '../error/handle.js'
import { getMajorVersion, isPrerelease } from '../utils/semver.js'

type PinnablePluginOptions = {
  packageName: string
  pinnedVersion?: string | undefined
  loadedFrom: string
  origin: string
}

type PluginRun = { package?: string; version?: string }

// `NetlifyAPI` types lack these operations, but the client generates them at runtime from the OpenAPI spec
type PluginsApi = {
  getLatestPluginRuns(params: { site_id: string; packages: string[]; state: string }): Promise<PluginRun[]>
  updatePlugin(params: {
    package: string
    site_id: string
    body: { pinned_version: string | undefined }
  }): Promise<unknown>
}

type SiteInfo = { id?: string | undefined }

// Retrieve plugin's pinned major versions by fetching the latest `PluginRun`
// Only applies to `netlify.toml`-only installed plugins.
export const addPinnedVersions = async function <T extends PinnablePluginOptions>({
  pluginsOptions,
  api,
  siteInfo: { id: siteId },
  sendStatus,
}: {
  pluginsOptions: T[]
  api: PluginsApi | undefined
  siteInfo: SiteInfo
  sendStatus: boolean
}): Promise<T[]> {
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

const shouldFetchPinVersion = function ({ pinnedVersion, loadedFrom, origin }: PinnablePluginOptions): boolean {
  return pinnedVersion === undefined && loadedFrom === 'auto_install' && origin === 'config'
}

const getPackageName = function ({ packageName }: PinnablePluginOptions): string {
  return packageName
}

const addPinnedVersion = function <T extends PinnablePluginOptions>(pluginOptions: T, pluginRuns: PluginRun[]): T {
  const foundPluginRun = pluginRuns.find((pluginRun) => pluginRun.package === pluginOptions.packageName)
  if (foundPluginRun === undefined) {
    return pluginOptions
  }

  const pinnedVersion = getMajorVersion(foundPluginRun.version)
  return pinnedVersion === undefined ? pluginOptions : { ...pluginOptions, pinnedVersion }
}

type PinPluginOptions = PinnablePluginOptions & { pluginPackageJson: PackageJson }

type PinErrorParams = Pick<
  ErrorParam,
  'childEnv' | 'mode' | 'netlifyConfig' | 'errorMonitor' | 'logs' | 'debug' | 'testOpts'
>

// Send an API request to pin plugins' major versions.
// Only applies to UI-installed plugins.
export const pinPlugins = async function ({
  pluginsOptions,
  failedPlugins,
  api,
  siteInfo: { id: siteId },
  sendStatus,
  ...errorParams
}: {
  pluginsOptions: PinPluginOptions[]
  // Dry runs have none
  failedPlugins: string[] | undefined
  api: PluginsApi | undefined
  siteInfo: SiteInfo
  sendStatus: boolean
} & PinErrorParams): Promise<void> {
  if ((errorParams.mode !== 'buildbot' && !sendStatus) || api === undefined || !siteId) {
    return
  }

  const pluginsOptionsA = pluginsOptions.filter((pluginOptions) => shouldPinVersion({ pluginOptions, failedPlugins }))
  await Promise.all(pluginsOptionsA.map((pluginOptions) => pinPlugin({ pluginOptions, api, siteId, errorParams })))
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
}: {
  pluginOptions: PinPluginOptions
  failedPlugins: string[] | undefined
}): boolean {
  return (
    !isPrerelease(version) &&
    pinnedVersion === undefined &&
    loadedFrom === 'auto_install' &&
    origin === 'ui' &&
    !isFailedPlugin(failedPlugins, packageName)
  )
}

const isFailedPlugin = function (failedPlugins: string[] | undefined, packageName: string): boolean {
  // Pinning after a dry run has always crashed here
  if (failedPlugins === undefined) {
    throw new TypeError("Cannot read properties of undefined (reading 'includes')")
  }

  return failedPlugins.includes(packageName)
}

const pinPlugin = async function ({
  pluginOptions: {
    packageName,
    pluginPackageJson: { version },
  },
  api,
  siteId,
  errorParams,
}: {
  pluginOptions: PinPluginOptions
  api: PluginsApi
  siteId: string
  errorParams: PinErrorParams
}): Promise<void> {
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

    await handleBuildError(error, errorParams)
  }
}

// Status is 404 if the plugin is uninstalled while the build is ongoing.
const shouldIgnoreError = function (error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'status' in error && error.status === 404
}
