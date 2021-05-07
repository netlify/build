'use strict'

const { major, minor, patch, clean: cleanVersion, lt: ltVersion, minVersion } = require('semver')

// Compare two versions by their major versions.
// Takes into account the special rules for `0.*.*` and `0.0.*` versions.
const isPreviousMajor = function (versionA, versionB) {
  return ltVersion(getMajor(versionA), getMajor(versionB))
}

// Remove minor/patch numbers
const getMajor = function (version) {
  return minVersion(getMajorVersion(version)).version
}

// According to semver, the second number is the major release number for
// `0.*.*` versions and the third for `0.0.*`. This is how `^` behaves with the
// `semver` module which is used by `npm`.
const getMajorVersion = function (version) {
  if (!version || cleanVersion(version) === null) {
    return
  }

  const majorVersion = major(version)
  if (majorVersion !== 0) {
    return `${majorVersion}`
  }

  const minorVersion = minor(version)
  if (minorVersion !== 0) {
    return `${majorVersion}.${minorVersion}`
  }

  const patchVersion = patch(version)
  return `${majorVersion}.${minorVersion}.${patchVersion}`
}

module.exports = { isPreviousMajor, getMajorVersion }
