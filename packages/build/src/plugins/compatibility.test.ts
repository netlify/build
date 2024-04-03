import { expect, test } from 'vitest'

import { getExpectedVersion } from './compatibility.js'
import { PluginVersion } from './list.js'

test('`getExpectedVersion` should ignore the new major version if the version is pinned', async () => {
  const versions: PluginVersion[] = [
    { version: '5.0.0', conditions: [] },
    { version: '4.41.2', conditions: [] },
  ]
  const { version } = await getExpectedVersion({
    versions,
    nodeVersion: '18.19.0',
    packageJson: {},
    buildDir: '/some/path',
    pinnedVersion: '4',
  })

  expect(version).toBe('4.41.2')
})

test('`getExpectedVersion` matches prerelease versions', async () => {
  const versions: PluginVersion[] = [
    { version: '5.0.0', conditions: [] },
    { version: '4.42.0-alpha.1', conditions: [] },
    { version: '4.41.2', conditions: [] },
  ]

  const { version: version1 } = await getExpectedVersion({
    versions,
    nodeVersion: '18.19.0',
    packageJson: {},
    buildDir: '/some/path',
  })
  const { version: version2 } = await getExpectedVersion({
    versions,
    nodeVersion: '18.19.0',
    packageJson: {},
    buildDir: '/some/path',
    pinnedVersion: '4',
  })

  expect(version1).toBe('5.0.0')
  expect(version2).toBe('4.42.0-alpha.1')
})

test('`getExpectedVersion`should retrieve a new major version if the overridePinnedVersion is specified', async () => {
  const versions: PluginVersion[] = [
    { version: '5.0.0', conditions: [], overridePinnedVersion: '>=4.0.0' },
    { version: '4.41.2', conditions: [] },
  ]

  const { version } = await getExpectedVersion({
    versions,
    nodeVersion: '18.19.0',
    packageJson: {},
    buildDir: '/some/path',
    pinnedVersion: '4',
  })

  expect(version).toBe('5.0.0')
})

test('`getExpectedVersion` should retrieve the plugin based on the condition of a nodeVersion', async () => {
  const versions: PluginVersion[] = [
    {
      version: '4.42.0',
      conditions: [{ type: 'nodeVersion', condition: '>=18.0.0' }],
    },
    { version: '4.41.2', conditions: [] },
  ]

  const { version } = await getExpectedVersion({
    versions,
    nodeVersion: '17.19.0',
    packageJson: {},
    buildDir: '/some/path',
    pinnedVersion: '4',
  })

  expect(version).toBe('4.41.2')
})

test('`getExpectedVersion` should retrieve the plugin based on conditions and feature flag due to pinned version', async () => {
  const versions: PluginVersion[] = [
    {
      version: '5.0.0-beta.1',
      conditions: [
        { type: 'nodeVersion', condition: '>= 18.0.0' },
        { type: 'siteDependencies', condition: { next: '>=13.5.0' } },
      ],
      overridePinnedVersion: '>=4.0.0',
    },
    {
      version: '4.42.0',
      conditions: [{ type: 'siteDependencies', condition: { next: '>=10.0.9' } }],
    },
    { version: '4.41.2', conditions: [] },
    {
      version: '3.9.2',
      conditions: [{ type: 'siteDependencies', condition: { next: '<10.0.9' } }],
    },
  ]

  const { version: version1 } = await getExpectedVersion({
    versions,
    nodeVersion: '17.19.0',
    packageJson: { dependencies: { next: '10.0.8' } },
    buildDir: '/some/path',
    pinnedVersion: '3',
  })
  expect(version1).toBe('3.9.2')

  const { version: version2 } = await getExpectedVersion({
    versions,
    nodeVersion: '17.19.0',
    packageJson: { dependencies: { next: '11.0.0' } },
    buildDir: '/some/path',
    pinnedVersion: '4',
  })
  expect(version2).toBe('4.42.0')

  const { version: version3 } = await getExpectedVersion({
    versions,
    nodeVersion: '18.19.0',
    packageJson: { dependencies: { next: '13.5.0' } },
    buildDir: '/some/path',
    pinnedVersion: '4',
  })
  expect(version3).toBe('5.0.0-beta.1')
})

test('`getExpectedVersion` should work with rc versions inside the siteDependencies constraints', async () => {
  const versions: PluginVersion[] = [
    {
      version: '5.0.0-beta.1',
      conditions: [
        { type: 'nodeVersion', condition: '>= 18.0.0' },
        { type: 'siteDependencies', condition: { next: '>=13.5.0' } },
      ],
      overridePinnedVersion: '>=4.0.0',
    },
    {
      version: '4.42.0',
      conditions: [{ type: 'siteDependencies', condition: { next: '>=10.0.9' } }],
    },
    { version: '4.41.2', conditions: [] },
    {
      version: '3.9.2',
      conditions: [{ type: 'siteDependencies', condition: { next: '<10.0.9' } }],
    },
  ]

  const { version } = await getExpectedVersion({
    versions,
    nodeVersion: '18.19.0',
    packageJson: { dependencies: { next: '14.1.1-canary.36' } },
    buildDir: '/some/path',
    pinnedVersion: '4',
  })
  expect(version).toBe('5.0.0-beta.1')
})

test('`getExpectedVersion` should retrieve the plugin based on conditions and feature flag due to pinned version', async () => {
  const versions: PluginVersion[] = [
    {
      version: '5.0.0-beta.1',
      conditions: [
        { type: 'nodeVersion', condition: '>= 18.0.0' },
        { type: 'siteDependencies', condition: { next: '>=13.5.0' } },
      ],
      overridePinnedVersion: '>=4.0.0',
    },
    { version: '4.41.2', conditions: [] },
    {
      version: '3.9.2',
      conditions: [{ type: 'siteDependencies', condition: { next: '<10.0.9' } }],
    },
  ]

  const { version: version1 } = await getExpectedVersion({
    versions,
    nodeVersion: '20.0.0',
    packageJson: { dependencies: { next: '14.0.0' } },
    buildDir: '/some/path',
    pinnedVersion: '4',
  })
  expect(version1).toBe('5.0.0-beta.1')

  // out of range
  const { version: version2 } = await getExpectedVersion({
    versions,
    nodeVersion: '20.0.0',
    packageJson: { dependencies: { next: '13.0.0' } },
    buildDir: '/some/path',
    pinnedVersion: '4',
  })
  expect(version2).toBe('4.41.2')
})

test('`getExpectedVersion` matches the first entry that satisfies the constraints, even if it also matches another entry further down with more specific constraints', async () => {
  const versions: PluginVersion[] = [
    { version: '4.41.2', conditions: [] },
    {
      version: '5.0.0-beta.1',
      conditions: [
        { type: 'nodeVersion', condition: '>= 18.0.0' },
        { type: 'siteDependencies', condition: { next: '>=13.5.0' } },
      ],
      overridePinnedVersion: '>=4.0.0',
    },
    {
      version: '3.9.2',
      conditions: [{ type: 'siteDependencies', condition: { next: '<10.0.9' } }],
    },
  ]

  const { version } = await getExpectedVersion({
    versions,
    nodeVersion: '20.0.0',
    packageJson: { dependencies: { next: '14.0.0' } },
    buildDir: '/some/path',
    pinnedVersion: '4',
  })
  expect(version).toBe('4.41.2')
})
