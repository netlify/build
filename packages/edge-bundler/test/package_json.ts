import test from 'ava'
import semver from 'semver'

import { getPackageVersion } from '../node/package_json.js'

test('`getPackageVersion` returns the package version`', (t) => {
  const version = getPackageVersion()

  t.not(semver.valid(version), null)
})
