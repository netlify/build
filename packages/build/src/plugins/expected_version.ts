import { PackageJson } from 'read-pkg-up'
import semver from 'semver'

import { FeatureFlags } from '../core/feature_flags.js'
import { addErrorInfo } from '../error/info.js'
import { importJsonFile } from '../utils/json.js'
import { resolvePath } from '../utils/resolve.js'

import { getExpectedVersion } from './compatibility.js'
import { PluginList, getPluginsList } from './list.js'
import { PluginsOptions } from './node_version.js'

/**
 * When using plugins in our official list, those are installed in .netlify/plugins/
 * We ensure that the last version that's been approved is always the one being used.
 * We also ensure that the plugin is our official list.
 */
export const addExpectedVersions = async function ({
  pluginsOptions,
  autoPluginsDir,
  packageJson,
  packagePath,
  debug,
  logs,
  buildDir,
  testOpts,
  featureFlags,
}) {
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
      }),
    ),
  )
}

/** Any `pluginOptions` with `expectedVersion` set will be automatically installed */
const addExpectedVersion = async function ({
  pluginsList,
  autoPluginsDir,
  packageJson,
  packagePath,
  pluginOptions,
  pluginOptions: { packageName, pluginPath, loadedFrom, nodeVersion, pinnedVersion },
  buildDir,
  featureFlags,
  testOpts,
}: {
  pluginsList: PluginList
  packageJson: PackageJson
  packagePath?: string
  buildDir: string
  pluginOptions: PluginsOptions & { nodeVersion: string }
  featureFlags: FeatureFlags
  testOpts: Record<string, unknown>
  autoPluginsDir: string
}) {
  if (!needsExpectedVersion(pluginOptions)) {
    return pluginOptions
  }

  if (pluginsList[packageName] === undefined) {
    validateUnlistedPlugin(packageName, loadedFrom, testOpts)
    return pluginOptions
  }

  const unfilteredVersions = pluginsList[packageName]
  const versions = filterVersions(unfilteredVersions, featureFlags)
  const [{ version: latestVersion, migrationGuide }] = versions
  const [{ version: expectedVersion }, { version: compatibleVersion, compatWarning }] = await Promise.all([
    getExpectedVersion({ versions, nodeVersion, packageJson, packagePath, buildDir, pinnedVersion }),
    getExpectedVersion({ versions, nodeVersion, packageJson, packagePath, buildDir }),
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

/**
 * Feature flagged versions are removed unless the feature flag is present.
 *  - This is done before conditions are applied since, unlike conditions,
 *    users cannot always choose to enable a feature flag.
 */
const filterVersions = function (unfilteredVersions, featureFlags) {
  return unfilteredVersions.filter(({ featureFlag }) => featureFlag === undefined || featureFlags[featureFlag])
}

/**
 * Checks whether plugin should be installed due to the wrong version being used
 * (either outdated, or mismatching compatibility requirements)
 */
const isMissingVersion = async function ({ autoPluginsDir, packageName, pluginPath, loadedFrom, expectedVersion }) {
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

const getAutoPluginVersion = async function (packageName, autoPluginsDir) {
  const packageJsonPath = await resolvePath(`${packageName}/package.json`, autoPluginsDir)
  const { version } = await importJsonFile(packageJsonPath)
  if (!version) {
    // this should never happen
    throw new Error('No version specified for the plugin!')
  }
  return version
}

const needsExpectedVersion = function ({ loadedFrom }: PluginsOptions) {
  return loadedFrom === 'auto_install' || loadedFrom === 'package.json'
}

/**
 * Plugins that are not in our official list can only be specified in
 * `netlify.toml` providing they are also installed in the site's package.json.
 * Otherwise, the build should fail.
 */
const validateUnlistedPlugin = function (packageName, loadedFrom, testOpts) {
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
