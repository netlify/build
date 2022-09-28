import semver from 'semver'
import { test, expect } from 'vitest'

import { getPackageVersion } from './package_json.js'

test('`getPackageVersion` returns the package version`', () => {
  const version = getPackageVersion()

  expect(semver.valid(version)).not.toBeNull()
})
