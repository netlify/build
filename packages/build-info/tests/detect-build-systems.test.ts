import { describe, expect, test } from 'vitest'

import { detectBuildSystem } from '../src/detect-build-system.js'

import { mockFileSystem } from './mock-file-system.js'

describe('Build System Detection', () => {
  test('detects nx when nx.json is present', () => {
    const rootDir = mockFileSystem({ 'nx.json': '' })
    const buildSystems = detectBuildSystem(rootDir)

    expect(buildSystems).toContain('nx')
  })

  test('detects lerna when lerna.json is present', () => {
    const rootDir = mockFileSystem({ 'lerna.json': '' })
    const buildSystems = detectBuildSystem(rootDir)

    expect(buildSystems).toContain('lerna')
  })
})
