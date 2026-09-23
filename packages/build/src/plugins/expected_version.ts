import { type PackageJson } from 'read-package-up'
import semver from 'semver'

import { FeatureFlags } from '../core/feature_flags.js'
import { addErrorInfo } from '../error/info.js'
import type { Logs } from '../log/logger.js'
import { SystemLogger } from '../plugins_core/types.js'
import { importJsonFile } from '../utils/json.js'
import { resolvePath } from '../utils/resolve.js'

import { getExpectedVersion } from './compatibility.js'
import { PluginList, PluginVersion, getPluginsList } from './list.js'
import { PluginsLoadedFrom, PluginsOptions } from './node_version.js'

type ExpectedVersionPluginOptions = PluginsOptions & { nodeVersion: string }

export type ExpectedVersionTestOptions = { pluginsListUrl?: string | undefined; skipPluginList?: boolean | undefined }

export type ExpectedVersions = {
  latestVersion: string
  expectedVersion: string
  compatibleVersion: string
  migrationGuide: string | undefined
  compatWarning: string
  isMissing: boolean
}

// Plugins that do not need an expected version, or are not in the plugins list
type NoExpectedVersions = { [Key in keyof ExpectedVersions]?: undefined }

export type MaybeExpectedVersions = ExpectedVersions | NoExpectedVersions

// When using plugins in our official list, those are installed in .netlify/plugins/
// We ensure that the last version that's been approved is always the one being used.
// We also ensure that the plugin is our official list.
export const addExpectedVersions = async function <T extends ExpectedVersionPluginOptions>({
  pluginsOptions,
  autoPluginsDir,
  packageJson,
  packagePath,
  debug,
  logs,
  buildDir,
  testOpts,
  featureFlags,
  systemLog,
}: {
  pluginsOptions: T[]
  autoPluginsDir: string
  packageJson: PackageJson
  packagePath: string | undefined
  debug: boolean
  logs: Logs | undefined
  buildDir: string
  testOpts: ExpectedVersionTestOptions
  featureFlags: FeatureFlags
  systemLog: SystemLogger
}): Promise<(T & MaybeExpectedVersions)[]> {
  if (!pluginsOptions.some(needsExpectedVersion)) {
    return pluginsOptions
  }

  const pluginsList = await getPluginsList({ debug, logs, testOpts })
  return await Promise.all(
    pluginsOptions.map((pluginOptions) =>
      addExpectedVersion({
        pluginsList,
        autoPluginsDir,
        packageJson,
        packagePath,
        pluginOptions,
        buildDir,
        featureFlags,
        testOpts,
        systemLog,
      }),
    ),
  )
}

/** Any `pluginOptions` with `expectedVersion` set will be automatically installed */
const addExpectedVersion = async function <T extends ExpectedVersionPluginOptions>({
  pluginsList,
  autoPluginsDir,
  packageJson,
  packagePath,
  pluginOptions,
  pluginOptions: { packageName, pluginPath, loadedFrom, nodeVersion, pinnedVersion },
  buildDir,
  featureFlags,
  testOpts,
  systemLog,
}: {
  pluginsList: PluginList
  packageJson: PackageJson
  packagePath: string | undefined
  buildDir: string
  pluginOptions: T
  featureFlags: FeatureFlags
  testOpts: ExpectedVersionTestOptions
  autoPluginsDir: string
  systemLog: SystemLogger
}): Promise<T & MaybeExpectedVersions> {
  if (!needsExpectedVersion(pluginOptions)) {
    return pluginOptions
  }

  const unfilteredVersions = pluginsList[packageName]
  if (unfilteredVersions === undefined) {
    validateUnlistedPlugin(packageName, loadedFrom, testOpts)
    return pluginOptions
  }

  const versions = filterVersions(unfilteredVersions, featureFlags)
  const [latestEntry] = versions
  // Keeps the error destructuring `versions` threw when feature flags filter out every version
  if (latestEntry === undefined) {
    throw new TypeError("Cannot read properties of undefined (reading 'version')")
  }
  const { version: latestVersion, migrationGuide } = latestEntry
  const [{ version: expectedVersion }, { version: compatibleVersion, compatWarning }] = await Promise.all([
    getExpectedVersion({
      versions,
      nodeVersion,
      packageJson,
      packageName,
      packagePath,
      buildDir,
      pinnedVersion,
      featureFlags,
      systemLog,
      authoritative: true,
    }),
    getExpectedVersion({
      versions,
      nodeVersion,
      packageJson,
      packageName,
      packagePath,
      buildDir,
      featureFlags,
      systemLog,
    }),
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

// Feature flagged versions are removed unless the feature flag is present.
//  - This is done before conditions are applied since, unlike conditions,
//    users cannot always choose to enable a feature flag.
const filterVersions = function (unfilteredVersions: PluginVersion[], featureFlags: FeatureFlags) {
  return unfilteredVersions.filter(({ featureFlag }) => featureFlag === undefined || featureFlags[featureFlag])
}

/**
 * Checks whether plugin should be installed due to the wrong version being used
 * (either outdated, or mismatching compatibility requirements)
 */
const isMissingVersion = async function ({
  autoPluginsDir,
  packageName,
  pluginPath,
  loadedFrom,
  expectedVersion,
}: {
  autoPluginsDir: string
  packageName: string
  pluginPath: string | undefined
  loadedFrom: PluginsLoadedFrom | undefined
  expectedVersion: string
}): Promise<boolean> {
  return (
    // We always respect the versions specified in `package.json`, as opposed
    // to auto-installed plugins
    loadedFrom !== 'package.json' &&
    // Plugin was not previously installed
    (pluginPath === undefined ||
      // Plugin was previously installed but a different version should be used
      !semver.satisfies(await getAutoPluginVersion(packageName, autoPluginsDir), expectedVersion))
  )
}

const getAutoPluginVersion = async function (packageName: string, autoPluginsDir: string): Promise<string> {
  const packageJsonPath = await resolvePath(`${packageName}/package.json`, autoPluginsDir)
  const { version } = await importJsonFile<PackageJson>(packageJsonPath)
  if (!version) {
    // this should never happen
    throw new Error('No version specified for the plugin!')
  }
  return version
}

const needsExpectedVersion = function ({ loadedFrom }: PluginsOptions) {
  return loadedFrom === 'auto_install' || loadedFrom === 'package.json'
}

// Plugins that are not in our official list can only be specified in
// `netlify.toml` providing they are also installed in the site's package.json.
// Otherwise, the build should fail.
const validateUnlistedPlugin = function (
  packageName: string,
  loadedFrom: PluginsLoadedFrom | undefined,
  testOpts: ExpectedVersionTestOptions,
) {
  if (testOpts.skipPluginList) {
    return
  }

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
