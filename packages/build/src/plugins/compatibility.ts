import _pEvery from 'p-every'
import pLocate from 'p-locate'
import { type PackageJson } from 'read-package-up'
import semver from 'semver'

import { FeatureFlags } from '../core/feature_flags.js'
import { SystemLogger } from '../plugins_core/types.js'

import { PluginVersion } from './list.js'
import { CONDITIONS } from './plugin_conditions.js'

// the types of that package seem to be not correct and demand a `pEvery.default()` usage which is wrong
const pEvery = _pEvery as unknown as typeof import('p-every').default

/**
 *  Retrieve the `expectedVersion` of a plugin:
 *   - This is the version which should be run
 *   - This takes version pinning into account
 *   - If this does not match the currently cached version, it is installed first
 *  This is also used to retrieve the `compatibleVersion` of a plugin
 *   - This is the most recent version compatible with this site
 *   - This is the same logic except it does not use version pinning
 *   - This is only used to print a warning message when the `compatibleVersion`
 *     is older than the currently used version.
 */
export const getExpectedVersion = async function ({
  versions,
  nodeVersion,
  packageJson,
  packageName,
  packagePath,
  buildDir,
  pinnedVersion,
  featureFlags,
  systemLog,
  authoritative,
}: {
  versions: PluginVersion[]
  /** The package.json of the repository */
  packageJson: PackageJson
  packageName: string
  packagePath?: string
  buildDir: string
  nodeVersion: string
  pinnedVersion?: string
  featureFlags?: FeatureFlags
  systemLog: SystemLogger
  /* Defines whether the version returned from this method is the authoritative
  version that will be used for the plugin; if not, the method may be called
  just to get information about other compatible versions that will not be
  selected */
  authoritative?: boolean
}) {
  const { version, conditions = [] } = await getCompatibleEntry({
    versions,
    nodeVersion,
    packageJson,
    packageName,
    packagePath,
    buildDir,
    pinnedVersion,
    featureFlags,
    systemLog: authoritative ? systemLog : undefined,
  })

  // Retrieve warning message shown when using an older version with `compatibility`
  const compatWarning = conditions.map(({ type, condition }) => CONDITIONS[type].warning(condition as any)).join(', ')
  return { version, compatWarning }
}

/**
 *  This function finds the right `compatibility` entry to use with the plugin.
 *   - `compatibility` entries are meant for backward compatibility
 *     Plugins should define each major version in `compatibility`.
 *   - The entries are sorted from most to least recent version.
 *   - After their first successful run, plugins are pinned by their major
 *     version which is passed as `pinnedVersion` to the next builds.
 *  When the plugin does not have a `pinnedVersion`, we use the most recent
 *  `compatibility` entry with a successful condition.
 *  When the plugin has a `pinnedVersion`, we do not use the `compatibility`
 *  conditions. Instead, we just use the most recent entry with a `version`
 *  matching `pinnedVersion`.
 *  When no `compatibility` entry matches, we use:
 *   - If there is a `pinnedVersion`, use it unless `latestVersion` matches it
 *   - Otherwise, use `latestVersion`
 */
const getCompatibleEntry = async function ({
  versions,
  nodeVersion,
  packageJson,
  packageName,
  packagePath,
  buildDir,
  pinnedVersion,
  featureFlags,
  systemLog = () => {
    // no-op
  },
}: {
  versions: PluginVersion[]
  packageJson: PackageJson
  buildDir: string
  nodeVersion: string
  packageName: string
  packagePath?: string
  pinnedVersion?: string
  featureFlags?: FeatureFlags
  systemLog?: SystemLogger
}): Promise<Pick<PluginVersion, 'conditions' | 'version'>> {
  const compatibleEntry = await pLocate(versions, async ({ version, overridePinnedVersion, conditions }) => {
    // When there's a `pinnedVersion`, we typically pick the first version that
    // matches that range. The exception is if `overridePinnedVersion` is also
    // present. This property says that if the pinned version is within a given
    // range, the entry that has this property can be used instead, even if its
    // own version doesn't satisfy the pinned version.
    const overridesPin = Boolean(
      pinnedVersion && overridePinnedVersion && semver.intersects(overridePinnedVersion, pinnedVersion),
    )

    // If there's a pinned version and this entry doesn't satisfy that range,
    // discard it. The exception is if this entry overrides the pinned version.
    if (pinnedVersion && !overridesPin && !semver.satisfies(version, pinnedVersion, { includePrerelease: true })) {
      return false
    }

    // no conditions means nothing to filter
    if (conditions.length === 0 && pinnedVersion === undefined) {
      return false
    }

    return await pEvery(conditions, async ({ type, condition }) =>
      CONDITIONS[type].test(condition as any, { nodeVersion, packageJson, packagePath, buildDir }),
    )
  })

  if (compatibleEntry) {
    systemLog(
      `Used compatible version '${compatibleEntry.version}' for plugin '${packageName}' (pinned version is ${pinnedVersion})`,
    )

    return compatibleEntry
  }

  if (pinnedVersion) {
    systemLog(`Used pinned version '${pinnedVersion}' for plugin '${packageName}'`)

    return { version: pinnedVersion, conditions: [] }
  }

  const legacyFallback = { version: versions[0].version, conditions: [] }
  const fallback = await getFirstCompatibleEntry({ versions, nodeVersion, packageJson, packagePath, buildDir })

  if (featureFlags?.netlify_build_updated_plugin_compatibility) {
    if (legacyFallback.version !== fallback.version) {
      systemLog(
        `Detected mismatch in selected version for plugin '${packageName}': used new version of '${fallback.version}' over legacy version '${legacyFallback.version}'`,
      )
    }

    return fallback
  }

  if (legacyFallback.version !== fallback.version) {
    systemLog(
      `Detected mismatch in selected version for plugin '${packageName}': used legacy version '${legacyFallback.version}' over new version '${fallback.version}'`,
    )
  }

  return legacyFallback
}

/**
 * Takes a list of plugin versions and returns the first entry that satisfies
 * the conditions (if any), without taking into account the pinned version.
 */
const getFirstCompatibleEntry = async function ({
  versions,
  nodeVersion,
  packageJson,
  packagePath,
  buildDir,
}: {
  versions: PluginVersion[]
  packageJson: PackageJson
  buildDir: string
  nodeVersion: string
  packagePath?: string
  pinnedVersion?: string
}): Promise<Pick<PluginVersion, 'conditions' | 'version'>> {
  const compatibleEntry = await pLocate(versions, async ({ conditions }) => {
    if (conditions.length === 0) {
      return true
    }

    return await pEvery(conditions, async ({ type, condition }) =>
      CONDITIONS[type].test(condition as any, { nodeVersion, packageJson, packagePath, buildDir }),
    )
  })

  if (compatibleEntry) {
    return compatibleEntry
  }

  // We should never get here, because it means there are no plugin versions
  // that we can install. We're keeping this here because it has been the
  // default behavior for a long time, but we should look to remove it.
  return { version: versions[0].version, conditions: [] }
}
