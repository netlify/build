import { expect, test } from 'vitest'

import { detectBuildSystems } from '../src/detect-build-system.js'

import { mockFileSystem } from './mock-file-system.js'

test('detects nx when nx.json is present', async () => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ devDependencies: { nx: '^14.7.13' } }),
    'nx.json': '',
  })

  const buildSystems = await detectBuildSystems(cwd)

  expect(buildSystems[0]).toEqual({ name: 'nx', version: '^14.7.13' })
})

test('detects lerna when lerna.json is present', async () => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ devDependencies: { lerna: '^5.5.2' } }),
    'lerna.json': '',
  })

  const buildSystems = await detectBuildSystems(cwd)
  expect(buildSystems[0]).toEqual({ name: 'lerna', version: '^5.5.2' })
})

test('detects turbo when turbo.json is present', async () => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ devDependencies: { turbo: '^1.6.3' } }),
    'turbo.json': '',
  })

  const buildSystems = await detectBuildSystems(cwd)
  expect(buildSystems[0]).toEqual({ name: 'turbo', version: '^1.6.3' })
})

test('detects rush when rush.json is present', async () => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ devDependencies: { rush: '^2.5.3' } }),
    'rush.json': '',
  })

  const buildSystems = await detectBuildSystems(cwd)
  expect(buildSystems[0]).toEqual({ name: 'rush', version: '^2.5.3' })
})

test('detects lage when lage.config.json is present', async () => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ devDependencies: { lage: '^1.5.0' } }),
    'lage.config.js': '',
  })

  const buildSystems = await detectBuildSystems(cwd)
  expect(buildSystems[0]).toEqual({ name: 'lage', version: '^1.5.0' })
})

test('detects pants when pants.toml is present', async () => {
  const cwd = mockFileSystem({
    'pants.toml': '',
  })

  const buildSystems = await detectBuildSystems(cwd)
  expect(buildSystems[0]).toEqual({ name: 'pants' })
})

test('detects buck when .buckconfig is present', async () => {
  const cwd = mockFileSystem({
    '.buckconfig': '',
  })

  const buildSystems = await detectBuildSystems(cwd)
  expect(buildSystems[0]).toEqual({ name: 'buck' })
})

test('detects gradle when build.gradle is present', async () => {
  const cwd = mockFileSystem({
    'build.gradle': '',
  })

  const buildSystems = await detectBuildSystems(cwd)
  expect(buildSystems[0]).toEqual({ name: 'gradle' })
})

test('detects bazel when .bazelrc is present', async () => {
  const cwd = mockFileSystem({
    '.bazelrc': '',
  })

  const buildSystems = await detectBuildSystems(cwd)
  expect(buildSystems[0]).toEqual({ name: 'bazel' })
})

test('detects moonrepo when .moon directory is present', async () => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ devDependencies: { moon: '^0.5.1' } }),
    '.moon/toolchain.yml': '',
  })

  const buildSystems = await detectBuildSystems(cwd)
  expect(buildSystems[0]).toEqual({ name: 'moon', version: '^0.5.1' })
})

test('detects build system in a monorepo setup', async () => {
  const cwd = mockFileSystem({
    'packages/website/package.json': JSON.stringify({ devDependencies: { turbo: '^1.6.3' } }),
    'packages/website/turbo.json': '',
    'packages/server/server.js': '',
  })

  const buildSystems = await detectBuildSystems('packages/website', cwd)
  expect(buildSystems[0]).toEqual({ name: 'turbo', version: '^1.6.3' })
})
