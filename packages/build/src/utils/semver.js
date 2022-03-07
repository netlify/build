import semver from 'semver'

// Compare two versions by their major versions.
// Takes into account the special rules for `0.*.*` and `0.0.*` versions.
export const isPreviousMajor = function (versionA, versionB) {
  return semver.lt(getMajor(versionA), getMajor(versionB))
}

// Remove minor/patch numbers
const getMajor = function (version) {
  return semver.minVersion(getMajorVersion(version)).version
}

// According to semver, the second number is the major release number for
// `0.*.*` versions and the third for `0.0.*`. This is how `^` behaves with the
// `semver` module which is used by `npm`.
export const getMajorVersion = function (version) {
  if (!version || semver.clean(version) === null) {
    return
  }

  const majorVersion = semver.major(version)
  if (majorVersion !== 0) {
    return `${majorVersion}`
  }

  const minorVersion = semver.minor(version)
  if (minorVersion !== 0) {
    return `${majorVersion}.${minorVersion}`
  }

  const patchVersion = semver.patch(version)
  return `${majorVersion}.${minorVersion}.${patchVersion}`
}
