import { describe, expect, test, beforeEach } from 'vitest'

import { detectBuildSystems } from '../src/detect-build-system.js'

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

    const buildSystems = detectBuildSystems(cwd)

    expect(buildSystems[0]).toEqual({ name: 'nx', version: '^14.7.13' })
  })

  test('detects lerna when lerna.json is present', () => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies: { lerna: '^5.5.2' } }),
      'lerna.json': '',
    })

    const buildSystems = detectBuildSystems(cwd)
    expect(buildSystems[0]).toEqual({ name: 'lerna', version: '^5.5.2' })
  })

  test('detects turbo when turbo.json is present', () => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies: { turbo: '^1.6.3' } }),
      'turbo.json': '',
    })

    const buildSystems = detectBuildSystems(cwd)
    expect(buildSystems[0]).toEqual({ name: 'turbo', version: '^1.6.3' })
  })

  test('detects rush when rush.json is present', () => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies: { rush: '^2.5.3' } }),
      'rush.json': '',
    })

    const buildSystems = detectBuildSystems(cwd)
    expect(buildSystems[0]).toEqual({ name: 'rush', version: '^2.5.3' })
  })

  test('detects lage when lage.config.json is present', () => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies: { lage: '^1.5.0' } }),
      'lage.config.js': '',
    })

    const buildSystems = detectBuildSystems(cwd)
    expect(buildSystems[0]).toEqual({ name: 'lage', version: '^1.5.0' })
  })
})
