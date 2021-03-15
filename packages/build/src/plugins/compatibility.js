'use strict'
const pEvery = require('p-every')
const pLocate = require('p-locate')
const { satisfies, clean: cleanVersion } = require('semver')

const { resolvePath } = require('../utils/resolve')

// Find a plugin's version using a set of conditions. Default to latest version.
// `conditions` is sorted from most to least recent version.
const getExpectedVersion = async function ({ latestVersion, compatibility, nodeVersion, packageJson, buildDir }) {
  const matchingCondition = await pLocate(compatibility, ({ conditions }) =>
    matchesCompatField({ conditions, nodeVersion, packageJson, buildDir }),
  )

  if (matchingCondition === undefined) {
    return { expectedVersion: latestVersion }
  }

  const { version: expectedVersion, conditions, migrationGuide } = matchingCondition
  const compatWarning = getCompatWarning(conditions, migrationGuide)
  return { expectedVersion, compatWarning }
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
