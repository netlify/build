'use strict'

// Find a plugin's version using a set of conditions. Default to latest version.
// `conditions` is sorted from most to least recent version.
const getExpectedVersion = function (latestVersion, compatibility) {
  const matchingCondition = compatibility.find((compatField) => matchesCompatField(compatField))

  if (matchingCondition === undefined) {
    return latestVersion
  }

  return matchingCondition.version
}

const matchesCompatField = function ({ conditions }) {
  return conditions.every(({ type, condition }) => CONDITIONS[type](condition))
}

// TODO: add some condition types: `nodeVersion`, `dependencies`
const CONDITIONS = {}

module.exports = { getExpectedVersion }
