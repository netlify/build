import { join } from 'path'

import { beforeEach, describe, expect, test, vi } from 'vitest'

import { mockFileSystem } from '../tests/mock-file-system.js'

import { detectPackageManager } from './detect-package-manager.js'

const env = { ...process.env }
beforeEach(() => {
  // restore process environment variables
  process.env = { ...env }
})

test('should repsect the NETLIFY_USE_PNPM if no lock file is there', async () => {
  process.env.NETLIFY_USE_PNPM = 'true'

  const cwd = mockFileSystem({
    'package.json': '{}',
  })
  const { name } = await detectPackageManager(cwd)
  expect(name).toBe('pnpm')
})

test('should favor the NETLIFY_USE_PNPM over a yarn.lock file', async () => {
  process.env.NETLIFY_USE_PNPM = 'true'

  const cwd = mockFileSystem({
    'package.json': '{}',
    'yarn.lock': '',
  })
  const { name } = await detectPackageManager(cwd)
  expect(name).toBe('pnpm')
})

test('should favor the NETLIFY_USE_YARN over a package-lock.json file', async () => {
  process.env.NETLIFY_USE_YARN = 'true'

  const cwd = mockFileSystem({
    'package.json': '{}',
    'package-lock.json': '',
  })
  const { name } = await detectPackageManager(cwd)
  expect(name).toBe('yarn')
})

test('should disable yarn with NETLIFY_USE_YARN and fallback to npm', async () => {
  process.env.NETLIFY_USE_YARN = 'false'

  const cwd = mockFileSystem({
    'package.json': '{}',
    'yarn.lock': '',
  })
  const { name } = await detectPackageManager(cwd)
  expect(name).toBe('npm')
})

test('should fallback to npm if just a package.json is present there', async () => {
  const cwd = mockFileSystem({
    'package.json': '{}',
  })
  const { name } = await detectPackageManager(cwd)
  expect(name).toBe('npm')
})

test('should use yarn if there is a yarn.lock in the root', async () => {
  const cwd = mockFileSystem({
    'package.json': '{}',
    'yarn.lock': '',
  })
  const { name } = await detectPackageManager(cwd)
  expect(name).toBe('yarn')
})

test('should use pnpm if there is a pnpm-lock.yaml in the root', async () => {
  const cwd = mockFileSystem({
    'package.json': '{}',
    'pnpm-lock.yaml': '',
  })
  const { name } = await detectPackageManager(cwd)
  expect(name).toBe('pnpm')
})

test('should use the `packageManager` property to detect yarn', async () => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ packageManager: 'yarn@3.2.1' }),
  })
  const { name } = await detectPackageManager(cwd)
  expect(name).toBe('yarn')
})

describe('workspaces package manager detection', () => {
  test('should use pnpm if there is a pnpm-lock.yaml in the workspace root', async () => {
    const cwd = mockFileSystem({
      'package.json': '{}',
      'pnpm-lock.yaml': '',
      'packages/astro-blog/package.json': '{}',
    })
    const { name } = await detectPackageManager(join(cwd, 'packages/astro-blog'))
    expect(name).toBe('pnpm')
  })

  test('should use yarn if there is a yarn.lock in the workspace root', async () => {
    const cwd = mockFileSystem({
      'package.json': '{}',
      'packages/astro-blog/package.json': '{}',
      'yarn.lock': '',
    })
    const { name } = await detectPackageManager(join(cwd, 'packages/astro-blog'))
    expect(name).toBe('yarn')
  })

  test('should use npm if there is a package-lock.json in the workspace root', async () => {
    const cwd = mockFileSystem({
      'package.json': '{}',
      'packages/astro-blog/package.json': '{}',
      'package-lock.json': '',
    })
    const { name } = await detectPackageManager(join(cwd, 'packages/astro-blog'))
    expect(name).toBe('npm')
  })

  test('should use the `packageManager` property to detect yarn', async () => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ packageManager: 'yarn@3.2.1' }),
      'packages/astro-blog/package.json': '{}',
    })
    const { name } = await detectPackageManager(join(cwd, 'packages/astro-blog'))
    expect(name).toBe('yarn')
  })

  test('should use the `packageManager` property to detect yarn', async () => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ packageManager: 'pnpm@^7.0.0' }),
      'packages/astro-blog/package.json': '{}',
    })
    const { name } = await detectPackageManager(join(cwd, 'packages/astro-blog'))
    expect(name).toBe('pnpm')
  })

  test('should ignore the root lock file if a package specifies a yarn.lock', async () => {
    const cwd = mockFileSystem({
      'package.json': '{}',
      'packages/astro-blog/package.json': '{}',
      'packages/astro-blog/yarn.lock': '',
      'package-lock.json': '',
    })
    const { name } = await detectPackageManager(join(cwd, 'packages/astro-blog'))
    expect(name).toBe('yarn')
  })

  test('should ignore the root lock file if a package specifies a pnpm-lock.yaml', async () => {
    const cwd = mockFileSystem({
      'package.json': '{}',
      'packages/astro-blog/package.json': '{}',
      'packages/astro-blog/pnpm-lock.yaml': '',
      'yarn.lock': '',
    })
    const { name } = await detectPackageManager(join(cwd, 'packages/astro-blog'))
    expect(name).toBe('pnpm')
  })

  test('should ignore the root packageManager field if specified in child package to use yarn', async () => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ packageManager: 'pnpm@^7.0.0' }),
      'packages/astro-blog/package.json': JSON.stringify({ packageManager: 'yarn@^3.0.0' }),
    })
    const { name } = await detectPackageManager(join(cwd, 'packages/astro-blog'))
    expect(name).toBe('yarn')
  })
})
