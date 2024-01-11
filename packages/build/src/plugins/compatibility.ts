import _pEvery from 'p-every'
import pLocate from 'p-locate'
import { PackageJson } from 'read-pkg-up'
import semver from 'semver'

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
  packagePath,
  buildDir,
  pinnedVersion,
}: {
  versions: PluginVersion[]
  /** The package.json of the repository */
  packageJson: PackageJson
  packagePath?: string
  buildDir: string
  nodeVersion: string
  pinnedVersion?: string
}) {
  const { version, conditions = [] } = await getCompatibleEntry({
    versions,
    nodeVersion,
    packageJson,
    packagePath,
    buildDir,
    pinnedVersion,
  })

  // Retrieve warning message shown when using an older version with `compatibility`
  const compatWarning = conditions.map(({ type, condition }) => CONDITIONS[type].warning(condition as any)).join(', ')
  return { version, compatWarning }
}

/**
 *  This function finds the right `compatibility` entry to use with the plugin.
 *   - `compatibitlity` entries are meant for backward compatibility
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
  packagePath,
  buildDir,
  pinnedVersion,
}: {
  versions: PluginVersion[]
  packageJson: PackageJson
  buildDir: string
  nodeVersion: string
  packagePath?: string
  pinnedVersion?: string
}): Promise<Pick<PluginVersion, 'conditions' | 'version'>> {
  const compatibleEntry = await pLocate(versions, async ({ version, overridePinnedVersion, conditions }) => {
    // Detect if the overridePinnedVersion intersects with the pinned version in this case we don't care about filtering
    const overridesPin = Boolean(
      pinnedVersion && overridePinnedVersion && semver.intersects(overridePinnedVersion, pinnedVersion),
    )

    // ignore versions that don't satisfy the pinned version here if a pinned version is set
    if (!overridesPin && pinnedVersion && !semver.satisfies(version, pinnedVersion, { includePrerelease: true })) {
      return false
    }

    // no conditions means nothing to filter
    if (conditions.length === 0) {
      return true
    }

    return await pEvery(conditions, async ({ type, condition }) =>
      CONDITIONS[type].test(condition as any, { nodeVersion, packageJson, packagePath, buildDir }),
    )
  })

  return compatibleEntry || { version: versions[0].version, conditions: [] }
}
