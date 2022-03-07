import pEvery from 'p-every'
import pLocate from 'p-locate'
import semver from 'semver'

import { importJsonFile } from '../utils/json.js'
import { resolvePath } from '../utils/resolve.js'

// Retrieve the `expectedVersion` of a plugin:
//  - This is the version which should be run
//  - This takes version pinning into account
//  - If this does not match the currently cached version, it is installed first
// This is also used to retrieve the `compatibleVersion` of a plugin
//  - This is the most recent version compatible with this site
//  - This is the same logic except it does not use version pinning
//  - This is only used to print a warning message when the `compatibleVersion`
//    is older than the currently used version.
export const getExpectedVersion = async function ({ versions, nodeVersion, packageJson, buildDir, pinnedVersion }) {
  const { version, conditions } = await getCompatibleEntry({
    versions,
    nodeVersion,
    packageJson,
    buildDir,
    pinnedVersion,
  })
  const compatWarning = getCompatWarning(conditions)
  return { version, compatWarning }
}

// This function finds the right `compatibility` entry to use with the plugin.
//  - `compatibitlity` entries are meant for backward compatibility
//    Plugins should define each major version in `compatibility`.
//  - The entries are sorted from most to least recent version.
//  - After their first successful run, plugins are pinned by their major
//    version which is passed as `pinnedVersion` to the next builds.
// When the plugin does not have a `pinnedVersion`, we use the most recent
// `compatibility` entry whith a successful condition.
// When the plugin has a `pinnedVersion`, we do not use the `compatibility`
// conditions. Instead, we just use the most recent entry with a `version`
// matching `pinnedVersion`.
// When no `compatibility` entry matches, we use:
//  - If there is a `pinnedVersion`, use it unless `latestVersion` matches it
//  - Otherwise, use `latestVersion`
const getCompatibleEntry = async function ({ versions, nodeVersion, packageJson, buildDir, pinnedVersion }) {
  if (pinnedVersion !== undefined) {
    return versions.find(({ version }) => semver.satisfies(version, pinnedVersion)) || { version: pinnedVersion }
  }

  const versionsWithConditions = versions.filter(hasConditions)
  const compatibleEntry = await pLocate(versionsWithConditions, ({ conditions }) =>
    matchesCompatField({ conditions, nodeVersion, packageJson, buildDir }),
  )
  return compatibleEntry || { version: versions[0].version }
}

// Ignore entries without conditions. Those are used to specify breaking
// changes, i.e. meant to be used for version pinning instead.
const hasConditions = function ({ conditions }) {
  return conditions.length !== 0
}

const matchesCompatField = async function ({ conditions, nodeVersion, packageJson, buildDir }) {
  return await pEvery(conditions, ({ type, condition }) =>
    CONDITIONS[type].test(condition, { nodeVersion, packageJson, buildDir }),
  )
}

// Retrieve warning message shown when using an older version with `compatibility`
const getCompatWarning = function (conditions = []) {
  return conditions.map(getConditionWarning).join(', ')
}

const getConditionWarning = function ({ type, condition }) {
  return CONDITIONS[type].warning(condition)
}

// Plugins can use `compatibility.{version}.nodeVersion: 'allowedNodeVersion'`
// to deliver different plugin versions based on the Node.js version
const nodeVersionTest = function (allowedNodeVersion, { nodeVersion }) {
  return semver.satisfies(nodeVersion, allowedNodeVersion)
}

const nodeVersionWarning = function (allowedNodeVersion) {
  return `Node.js ${allowedNodeVersion}`
}

const siteDependenciesTest = async function (
  allowedSiteDependencies,
  { packageJson: { devDependencies, dependencies }, buildDir },
) {
  const siteDependencies = { ...devDependencies, ...dependencies }
  return await pEvery(Object.entries(allowedSiteDependencies), ([dependencyName, allowedVersion]) =>
    siteDependencyTest({ dependencyName, allowedVersion, siteDependencies, buildDir }),
  )
}

const siteDependencyTest = async function ({ dependencyName, allowedVersion, siteDependencies, buildDir }) {
  const siteDependency = siteDependencies[dependencyName]
  if (typeof siteDependency !== 'string') {
    return false
  }

  // if this is a valid version we can apply the rule directly
  if (semver.clean(siteDependency) !== null) {
    return semver.satisfies(siteDependency, allowedVersion)
  }

  try {
    // if this is a range we need to get the exact version
    const packageJsonPath = await resolvePath(`${dependencyName}/package.json`, buildDir)
    const { version } = await importJsonFile(packageJsonPath)
    return semver.satisfies(version, allowedVersion)
  } catch {
    return false
  }
}

const siteDependenciesWarning = function (allowedSiteDependencies) {
  return Object.entries(allowedSiteDependencies).map(siteDependencyWarning).join(',')
}

const siteDependencyWarning = function ([dependencyName, allowedVersion]) {
  return `${dependencyName}@${allowedVersion}`
}

export const CONDITIONS = {
  nodeVersion: { test: nodeVersionTest, warning: nodeVersionWarning },
  siteDependencies: { test: siteDependenciesTest, warning: siteDependenciesWarning },
}
