'use strict'

const { satisfies } = require('semver')

// Find a plugin's version using a set of conditions. Default to latest version.
// `conditions` is sorted from most to least recent version.
const getExpectedVersion = function ({ latestVersion, compatibility, nodeVersion }) {
  const matchingCondition = compatibility.find(({ conditions }) => matchesCompatField({ conditions, nodeVersion }))

  if (matchingCondition === undefined) {
    return { expectedVersion: latestVersion }
  }

  const { version: expectedVersion, conditions } = matchingCondition
  const compatWarning = getCompatWarning(conditions)
  return { expectedVersion, compatWarning }
}

const matchesCompatField = function ({ conditions, nodeVersion }) {
  return conditions.every(({ type, condition }) => CONDITIONS[type].test(condition, { nodeVersion }))
}

// Retrieve warning message shown when using an older version with `compatibility`
const getCompatWarning = function (conditions) {
  return conditions.map(getConditionWarning).join(', ')
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

// TODO: add some condition types: `dependencies`
const CONDITIONS = {
  nodeVersion: { test: nodeVersionTest, warning: nodeVersionWarning },
}

module.exports = { getExpectedVersion }
