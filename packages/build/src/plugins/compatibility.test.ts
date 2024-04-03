import { describe, expect, test } from 'vitest'

import { getExpectedVersion } from './compatibility.js'
import { PluginVersion } from './list.js'

const noopSystemLog = () => {
  // no-op
}

describe(`getExpectedVersion`, () => {
  test('should ignore the new major version if the version is pinned', async () => {
    const versions: PluginVersion[] = [
      { version: '5.0.0', conditions: [] },
      { version: '4.41.2', conditions: [] },
    ]
    const { version } = await getExpectedVersion({
      versions,
      nodeVersion: '18.19.0',
      packageJson: {},
      packageName: '@netlify/cool-plugin',
      buildDir: '/some/path',
      pinnedVersion: '4',
      systemLog: noopSystemLog,
    })

    expect(version).toBe('4.41.2')
  })

  test('matches prerelease versions', async () => {
    const versions: PluginVersion[] = [
      { version: '5.0.0', conditions: [] },
      { version: '4.42.0-alpha.1', conditions: [] },
      { version: '4.41.2', conditions: [] },
    ]

    const { version: version1 } = await getExpectedVersion({
      versions,
      nodeVersion: '18.19.0',
      packageJson: {},
      packageName: '@netlify/cool-plugin',
      buildDir: '/some/path',
      systemLog: noopSystemLog,
    })
    const { version: version2 } = await getExpectedVersion({
      versions,
      nodeVersion: '18.19.0',
      packageJson: {},
      packageName: '@netlify/cool-plugin',
      buildDir: '/some/path',
      pinnedVersion: '4',
      systemLog: noopSystemLog,
    })

    expect(version1).toBe('5.0.0')
    expect(version2).toBe('4.42.0-alpha.1')
  })

  test('should retrieve a new major version if the overridePinnedVersion is specified', async () => {
    const versions: PluginVersion[] = [
      { version: '5.0.0', conditions: [], overridePinnedVersion: '>=4.0.0' },
      { version: '4.41.2', conditions: [] },
    ]

    const { version } = await getExpectedVersion({
      versions,
      nodeVersion: '18.19.0',
      packageJson: {},
      packageName: '@netlify/cool-plugin',
      buildDir: '/some/path',
      pinnedVersion: '4',
      systemLog: noopSystemLog,
    })

    expect(version).toBe('5.0.0')
  })

  test('should retrieve the plugin based on the condition of a nodeVersion', async () => {
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
      packageName: '@netlify/cool-plugin',
      buildDir: '/some/path',
      pinnedVersion: '4',
      systemLog: noopSystemLog,
    })

    expect(version).toBe('4.41.2')
  })

  test('should retrieve the plugin based on conditions and feature flag due to pinned version', async () => {
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
      packageName: '@netlify/cool-plugin',
      buildDir: '/some/path',
      pinnedVersion: '3',
      systemLog: noopSystemLog,
    })
    expect(version1).toBe('3.9.2')

    const { version: version2 } = await getExpectedVersion({
      versions,
      nodeVersion: '17.19.0',
      packageJson: { dependencies: { next: '11.0.0' } },
      packageName: '@netlify/cool-plugin',
      buildDir: '/some/path',
      pinnedVersion: '4',
      systemLog: noopSystemLog,
    })
    expect(version2).toBe('4.42.0')

    const { version: version3 } = await getExpectedVersion({
      versions,
      nodeVersion: '18.19.0',
      packageJson: { dependencies: { next: '13.5.0' } },
      packageName: '@netlify/cool-plugin',
      buildDir: '/some/path',
      pinnedVersion: '4',
      systemLog: noopSystemLog,
    })
    expect(version3).toBe('5.0.0-beta.1')
  })

  test('should work with rc versions inside the siteDependencies constraints', async () => {
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
      packageName: '@netlify/cool-plugin',
      buildDir: '/some/path',
      pinnedVersion: '4',
      systemLog: noopSystemLog,
    })
    expect(version).toBe('5.0.0-beta.1')
  })

  test('should retrieve the plugin based on conditions and feature flag due to pinned version', async () => {
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
      packageName: '@netlify/cool-plugin',
      buildDir: '/some/path',
      pinnedVersion: '4',
      systemLog: noopSystemLog,
    })
    expect(version1).toBe('5.0.0-beta.1')

    // out of range
    const { version: version2 } = await getExpectedVersion({
      versions,
      nodeVersion: '20.0.0',
      packageJson: { dependencies: { next: '13.0.0' } },
      packageName: '@netlify/cool-plugin',
      buildDir: '/some/path',
      pinnedVersion: '4',
      systemLog: noopSystemLog,
    })
    expect(version2).toBe('4.41.2')
  })

  test('matches the first entry that satisfies the constraints, even if it also matches another entry further down with more specific constraints', async () => {
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
      packageName: '@netlify/cool-plugin',
      buildDir: '/some/path',
      pinnedVersion: '4',
      systemLog: noopSystemLog,
    })
    expect(version).toBe('4.41.2')
  })

  test('if no pinned version is set, it matches the first version regardless of whether its requirements match the conditions (legacy behavior)', async () => {
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

    const logMessages: string[] = []

    const { version } = await getExpectedVersion({
      versions,
      nodeVersion: '20.0.0',
      packageJson: { dependencies: { next: '12.0.0' } },
      packageName: '@netlify/cool-plugin',
      buildDir: '/some/path',
      systemLog: (message: string) => {
        logMessages.push(message)
      },
    })

    expect(logMessages.length).toBe(1)
    expect(logMessages[0]).toBe(
      `Detected mismatch in selected version for plugin '@netlify/cool-plugin': used legacy version '5.0.0-beta.1' over new version '4.41.2'`,
    )
    expect(version).toBe('5.0.0-beta.1')
  })

  test('if no pinned version is set, it matches the first version whose requirements match the conditions', async () => {
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

    const logMessages: string[] = []

    const { version } = await getExpectedVersion({
      versions,
      nodeVersion: '20.0.0',
      packageJson: { dependencies: { next: '12.0.0' } },
      packageName: '@netlify/cool-plugin',
      buildDir: '/some/path',
      systemLog: (message: string) => {
        logMessages.push(message)
      },
      featureFlags: {
        netlify_build_updated_plugin_compatibility: true,
      },
    })

    expect(logMessages.length).toBe(1)
    expect(logMessages[0]).toBe(
      `Detected mismatch in selected version for plugin '@netlify/cool-plugin': used new version of '4.41.2' over legacy version '5.0.0-beta.1'`,
    )
    expect(version).toBe('4.41.2')
  })
})
