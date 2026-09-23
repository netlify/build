import semver from 'semver'

// Compare two versions by their major versions.
// Takes into account the special rules for `0.*.*` and `0.0.*` versions.
export const isPreviousMajor = function (versionA: string, versionB: string): boolean {
  return semver.lt(getMajor(versionA), getMajor(versionB))
}

// Remove minor/patch numbers
const getMajor = function (version: string): string {
  const majorVersion = getMajorVersion(version)
  const minVersion = majorVersion === undefined ? null : semver.minVersion(majorVersion)

  // Invalid versions are not validated upstream, so this still crashes as before
  if (minVersion === null) {
    throw new TypeError(`Invalid version: ${version}`)
  }

  return minVersion.version
}

// According to semver, the second number is the major release number for
// `0.*.*` versions and the third for `0.0.*`. This is how `^` behaves with the
// `semver` module which is used by `npm`.
export const getMajorVersion = function (version: string | undefined): string | undefined {
  if (!version || semver.clean(version) === null) {
    return
  }

  const majorVersion = semver.major(version)
  if (majorVersion !== 0) {
    return String(majorVersion)
  }

  const minorVersion = semver.minor(version)
  if (minorVersion !== 0) {
    return `0.${String(minorVersion)}`
  }

  const patchVersion = semver.patch(version)
  return `0.0.${String(patchVersion)}`
}

export const isPrerelease = function (version: string | undefined): readonly (string | number)[] | null {
  // `semver.prerelease()` also returns `null` for `undefined`
  return version === undefined ? null : semver.prerelease(version)
}
