'use strict'
const pEvery = require('p-every')
const pLocate = require('p-locate')
const { satisfies, clean: cleanVersion } = require('semver')

const { resolvePath } = require('../utils/resolve')

// Retrieve the `expectedVersion` of a plugin:
//  - This is the version which should be run
//  - This takes version pinning into account
//  - If this does not match the currently cached version, it is installed first
// This is also used to retrieve the `compatibleVersion` of a plugin
//  - This is the most recent version compatible with this site
//  - This is the same logic except it does not use version pinning
//  - This is only used to print a warning message when the `compatibleVersion`
//    is older than the currently used version.
const getExpectedVersion = async function ({
  latestVersion,
  compatibility,
  nodeVersion,
  packageJson,
  buildDir,
  pinnedVersion,
}) {
  const pinnedCompatibility = getPinnedCompatibility(pinnedVersion, compatibility)
  const { version, compatWarning } = await findCompatibleVersion({
    compatibility: pinnedCompatibility,
    nodeVersion,
    packageJson,
    buildDir,
  })

  if (version !== undefined) {
    return { version, compatWarning }
  }

  if (pinnedVersion === undefined || satisfies(latestVersion, pinnedVersion)) {
    return { version: latestVersion }
  }

  return { version: pinnedVersion }
}

// Major versions are pinned using `pinnedVersion`.
// Plugins should define each major version in `compatibility`. However, as a
// failsafe, we default to the most recent version satisying `pinnedVersion`.
// If no `pinnedVersion` is defined, it defaults to the most recent version
// specified in `plugins.json` instead.
const getPinnedCompatibility = function (pinnedVersion, compatibility) {
  return pinnedVersion === undefined
    ? compatibility
    : compatibility.filter(({ version }) => satisfies(version, pinnedVersion))
}

// Find a plugin's version using a set of conditions. Default to latest version.
// `conditions` is sorted from most to least recent version.
const findCompatibleVersion = async function ({ compatibility, nodeVersion, packageJson, buildDir }) {
  const matchingCondition = await pLocate(compatibility, ({ conditions }) =>
    matchesCompatField({ conditions, nodeVersion, packageJson, buildDir }),
  )

  if (matchingCondition === undefined) {
    return {}
  }

  const { version, conditions, migrationGuide } = matchingCondition
  const compatWarning = getCompatWarning(conditions, migrationGuide)
  return { version, compatWarning }
}

const matchesCompatField = async function ({ conditions, nodeVersion, packageJson, buildDir }) {
  return await pEvery(conditions, ({ type, condition }) =>
    CONDITIONS[type].test(condition, { nodeVersion, packageJson, buildDir }),
  )
}

// Retrieve warning message shown when using an older version with `compatibility`
const getCompatWarning = function (conditions, migrationGuide) {
  const compatWarning = conditions.map(getConditionWarning).join(', ')
  return migrationGuide === undefined ? compatWarning : `${compatWarning}\nMigration guide: ${migrationGuide}`
}

const getConditionWarning = function ({ type, condition }) {
  return CONDITIONS[type].warning(condition)
}

// Plugins can use `compatibility.{version}.nodeVersion: 'allowedNodeVersion'`
// to deliver different plugin versions based on the Node.js version
const nodeVersionTest = function (allowedNodeVersion, { nodeVersion }) {
  return satisfies(nodeVersion, allowedNodeVersion)
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
  if (cleanVersion(siteDependency) !== null) {
    return satisfies(siteDependency, allowedVersion)
  }

  try {
    // if this is a range we need to get the exact version
    const packageJsonPath = await resolvePath(`${dependencyName}/package.json`, buildDir)
    // eslint-disable-next-line node/global-require, import/no-dynamic-require
    const { version } = require(packageJsonPath)
    return satisfies(version, allowedVersion)
  } catch (error) {
    return false
  }
}

const siteDependenciesWarning = function (allowedSiteDependencies) {
  return Object.entries(allowedSiteDependencies).map(siteDependencyWarning).join(',')
}

const siteDependencyWarning = function ([dependencyName, allowedVersion]) {
  return `${dependencyName}@${allowedVersion}`
}

const CONDITIONS = {
  nodeVersion: { test: nodeVersionTest, warning: nodeVersionWarning },
  siteDependencies: { test: siteDependenciesTest, warning: siteDependenciesWarning },
}

module.exports = { getExpectedVersion }
