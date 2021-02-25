'use strict'

const { satisfies } = require('semver')

// Find a plugin's version using a set of conditions. Default to latest version.
// `conditions` is sorted from most to least recent version.
const getExpectedVersion = function ({ latestVersion, compatibility, nodeVersion }) {
  const matchingCondition = compatibility.find(({ conditions }) => matchesCompatField({ conditions, nodeVersion }))

  if (matchingCondition === undefined) {
    return latestVersion
  }

  return matchingCondition.version
}

const matchesCompatField = function ({ conditions, nodeVersion }) {
  return conditions.every(({ type, condition }) => CONDITIONS[type](condition, { nodeVersion }))
}

// Plugins can use `compatibility.{version}.nodeVersion: 'allowedNodeVersion'`
// to deliver different plugin versions based on the Node.js version
const nodeVersionCondition = function (allowedNodeVersion, { nodeVersion }) {
  return satisfies(nodeVersion, allowedNodeVersion)
}

// TODO: add some condition types: `dependencies`
const CONDITIONS = {
  nodeVersion: nodeVersionCondition,
}

module.exports = { getExpectedVersion }
