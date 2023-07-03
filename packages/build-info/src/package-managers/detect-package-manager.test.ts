import { join } from 'path'

import { beforeEach, describe, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

import { detectPackageManager } from './detect-package-manager.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('should not detect a package manager if nothing is related to javascript', async ({ fs }) => {
  const cwd = mockFileSystem({
    'go.mod': '',
  })
  const project = new Project(fs, cwd)
  const pkgManager = await detectPackageManager(project)
  expect(pkgManager).toBeNull()
})

test('should prefer the package manager property over the NETLIFY_USE_PNPM environment variable', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ packageManager: 'yarn@3.2.1' }),
  })
  const project = new Project(fs, cwd).setEnvironment({ NETLIFY_USE_PNPM: 'true' })
  const pkgManager = await detectPackageManager(project)
  expect(pkgManager?.name).toBe('yarn')
})

test('should repsect the NETLIFY_USE_PNPM if no lock file is there', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': '{}',
  })
  const project = new Project(fs, cwd).setEnvironment({ NETLIFY_USE_PNPM: 'true' })
  const pkgManager = await detectPackageManager(project)
  expect(pkgManager?.name).toBe('pnpm')
})

test('should favor the NETLIFY_USE_PNPM over a yarn.lock file', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': '{}',
    'yarn.lock': '',
  })
  const project = new Project(fs, cwd).setEnvironment({ NETLIFY_USE_PNPM: 'true' })
  const pkgManager = await detectPackageManager(project)
  expect(pkgManager?.name).toBe('pnpm')
})

test('should favor the NETLIFY_USE_YARN over a package-lock.json file', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': '{}',
    'package-lock.json': '',
  })
  const project = new Project(fs, cwd).setEnvironment({ NETLIFY_USE_YARN: 'true' })
  const pkgManager = await detectPackageManager(project)
  expect(pkgManager?.name).toBe('yarn')
})

test('should disable yarn with NETLIFY_USE_YARN and fallback to npm', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': '{}',
    'yarn.lock': '',
  })
  const project = new Project(fs, cwd).setEnvironment({ NETLIFY_USE_YARN: 'false' })
  const pkgManager = await detectPackageManager(project)
  expect(pkgManager?.name).toBe('npm')
})

test('should fallback to npm if just a package.json is present there', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': '{}',
  })
  const project = new Project(fs, cwd)
  const pkgManager = await detectPackageManager(project)
  expect(pkgManager?.name).toBe('npm')
})

test('should use yarn if there is a yarn.lock in the root', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': '{}',
    'yarn.lock': '',
  })
  const project = new Project(fs, cwd)
  const pkgManager = await detectPackageManager(project)
  expect(pkgManager?.name).toBe('yarn')
})

test('should use pnpm if there is a pnpm-lock.yaml in the root', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': '{}',
    'pnpm-lock.yaml': '',
  })
  const project = new Project(fs, cwd)
  const pkgManager = await detectPackageManager(project)
  expect(pkgManager?.name).toBe('pnpm')
})

test('should use the `packageManager` property to detect yarn', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ packageManager: 'yarn@3.2.1' }),
  })
  const project = new Project(fs, cwd)
  const pkgManager = await detectPackageManager(project)
  expect(pkgManager?.name).toBe('yarn')
})

describe('workspaces package manager detection', () => {
  test('should use pnpm if there is a pnpm-lock.yaml in the workspace root', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': '{}',
      'pnpm-lock.yaml': '',
      'packages/astro-blog/package.json': '{}',
    })
    const project = new Project(fs, join(cwd, 'packages/astro-blog'), cwd)
    const pkgManager = await detectPackageManager(project)
    expect(pkgManager?.name).toBe('pnpm')
  })

  test('should use yarn if there is a yarn.lock in the workspace root', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': '{}',
      'packages/astro-blog/package.json': '{}',
      'yarn.lock': '',
    })
    const project = new Project(fs, join(cwd, 'packages/astro-blog'), cwd)
    const pkgManager = await detectPackageManager(project)
    expect(pkgManager?.name).toBe('yarn')
  })

  test('should use npm if there is a package-lock.json in the workspace root', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': '{}',
      'packages/astro-blog/package.json': '{}',
      'package-lock.json': '',
    })
    const project = new Project(fs, join(cwd, 'packages/astro-blog'))
    const pkgManager = await detectPackageManager(project)
    expect(pkgManager?.name).toBe('npm')
  })

  test('should use the `packageManager` property to detect yarn', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ packageManager: 'yarn@3.2.1' }),
      'packages/astro-blog/package.json': '{}',
    })
    const project = new Project(fs, join(cwd, 'packages/astro-blog'))
    const pkgManager = await detectPackageManager(project)
    expect(pkgManager?.name).toBe('yarn')
  })

  test('should use the `packageManager` property to detect yarn', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ packageManager: 'pnpm@^7.0.0' }),
      'packages/astro-blog/package.json': '{}',
    })
    const project = new Project(fs, join(cwd, 'packages/astro-blog'))
    const pkgManager = await detectPackageManager(project)
    expect(pkgManager?.name).toBe('pnpm')
  })

  test('should ignore the root lock file if a package specifies a yarn.lock', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': '{}',
      'packages/astro-blog/package.json': '{}',
      'packages/astro-blog/yarn.lock': '',
      'package-lock.json': '',
    })
    const project = new Project(fs, join(cwd, 'packages/astro-blog'))
    const pkgManager = await detectPackageManager(project)
    expect(pkgManager?.name).toBe('yarn')
  })

  test('should ignore the root lock file if a package specifies a pnpm-lock.yaml', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': '{}',
      'packages/astro-blog/package.json': '{}',
      'packages/astro-blog/pnpm-lock.yaml': '',
      'yarn.lock': '',
    })
    const project = new Project(fs, join(cwd, 'packages/astro-blog'))
    const pkgManager = await detectPackageManager(project)
    expect(pkgManager?.name).toBe('pnpm')
  })

  test('should ignore the root packageManager field if specified in child package to use yarn', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ packageManager: 'pnpm@^7.0.0' }),
      'packages/astro-blog/package.json': JSON.stringify({ packageManager: 'yarn@^3.0.0' }),
    })
    const project = new Project(fs, join(cwd, 'packages/astro-blog'))
    const pkgManager = await detectPackageManager(project)
    expect(pkgManager?.name).toBe('yarn')
  })
})
