import { describe, expect, test, beforeEach } from 'vitest'

import { detectBuildSystem } from '../src/detect-build-system.js'

import { mockFileSystem } from './mock-file-system.js'

describe('Build System Detection', () => {
  const env = { ...process.env }
  beforeEach(() => {
    // restore process environment variables
    process.env = { ...env }
  })

  test('detects nx when nx.json is present', () => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies: { nx: '^14.7.13' } }),
      'nx.json': '',
    })

    const buildSystems = detectBuildSystem(cwd, cwd)

    expect(buildSystems[0]).toEqual({ name: 'nx', version: '^14.7.13' })
  })

  test('detects lerna when lerna.json is present', () => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies: { lerna: '^5.5.2' } }),
      'lerna.json': '',
    })

    const buildSystems = detectBuildSystem(cwd, cwd)
    expect(buildSystems[0]).toEqual({ name: 'lerna', version: '^5.5.2' })
  })
})
