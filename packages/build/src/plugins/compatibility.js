'use strict'

const { satisfies, valid: validVersion } = require('semver')

// Find a plugin's version using a set of conditions. Default to latest version.
// `conditions` is sorted from most to least recent version.
const getExpectedVersion = function ({ latestVersion, compatibility, nodeVersion, packageJson }) {
  const matchingCondition = compatibility.find(({ conditions }) =>
    matchesCompatField({ conditions, nodeVersion, packageJson }),
  )

  if (matchingCondition === undefined) {
    return { expectedVersion: latestVersion }
  }

  const { version: expectedVersion, conditions, migrationGuide } = matchingCondition
  const compatWarning = getCompatWarning(conditions, migrationGuide)
  return { expectedVersion, compatWarning }
}

const matchesCompatField = function ({ conditions, nodeVersion, packageJson }) {
  return conditions.every(({ type, condition }) => CONDITIONS[type].test(condition, { nodeVersion, packageJson }))
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

const siteDependenciesTest = function (allowedSiteDependencies, { packageJson: { devDependencies, dependencies } }) {
  const siteDependencies = { ...devDependencies, ...dependencies }
  return Object.entries(allowedSiteDependencies).every(([dependencyName, allowedVersion]) =>
    siteDependencyTest({ dependencyName, allowedVersion, siteDependencies }),
  )
}

const siteDependencyTest = function ({ dependencyName, allowedVersion, siteDependencies }) {
  const siteDependency = siteDependencies[dependencyName]
  if (typeof siteDependency !== 'string') {
    return false
  }

  // if this is a valid version we can apply the rule directly
  if (validVersion(siteDependency)) {
    return satisfies(siteDependency, allowedVersion)
  }

  try {
    // if this is a range we need to get the exact version
    // eslint-disable-next-line node/global-require,import/no-dynamic-require
    const { version } = require(`${dependencyName}/package.json`)
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
