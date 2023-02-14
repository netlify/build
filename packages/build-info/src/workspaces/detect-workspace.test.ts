import { join } from 'path'

import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('workspace detection should throw if no package manager was detected previously', async ({ fs }) => {
  const cwd = mockFileSystem({})
  const project = new Project(fs, cwd)

  await expect(async () => await project.detectWorkspaces()).rejects.toThrowError()
})

test('should detect workspace packages correctly for an npm workspace', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      workspaces: ['apps/*'],
    }),
    'apps/a/package.json': '',
    'apps/b/package.json': '',
    'apps/b/deep/package.json': '',
    'apps/c/package.json': '',
  })

  const project = new Project(fs, cwd)
  await project.detectPackageManager()
  expect(project.packageManager).toMatchObject({ name: 'npm' })
  expect(await project.detectWorkspaces()).toMatchObject({
    isRoot: true,
    packages: [join(cwd, 'apps/a'), join(cwd, 'apps/b'), join(cwd, 'apps/c')],
  })
})

test('should detect workspace packages correctly for an npm workspace from a nested directory', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      workspaces: ['apps/*'],
    }),
    'apps/a/package.json': '{}',
    'apps/b/package.json': '{}',
    'apps/b/deep/package.json': '{}',
    'apps/c/package.json': '{}',
  })

  const project = new Project(fs, cwd, 'apps/b/deep')
  await project.detectPackageManager()
  expect(project.packageManager).toMatchObject({ name: 'npm' })
  expect(await project.detectWorkspaces()).toMatchObject({
    isRoot: false,
    packages: [join(cwd, 'apps/a'), join(cwd, 'apps/b'), join(cwd, 'apps/c')],
  })
})

test('should detect pnpm workspace correctly from a nested directory', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': '{}',
    'pnpm-workspace.yaml': 'packages:\n - apps/*',
    'pnpm-lock.yaml': '',
    'apps/a/package.json': '{}',
    'apps/b/package.json': '{}',
    'apps/b/deep/package.json': '{}',
    'apps/c/package.json': '{}',
  })

  const project = new Project(fs, cwd, 'apps/b/deep')
  await project.detectPackageManager()
  expect(project.packageManager).toMatchObject({ name: 'pnpm' })
  expect(await project.detectWorkspaces()).toMatchObject({
    isRoot: false,
    packages: [join(cwd, 'apps/a'), join(cwd, 'apps/b'), join(cwd, 'apps/c')],
  })
})

test('should detect pnpm workspace correctly', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': '{}',
    'pnpm-workspace.yaml': 'packages:\n - apps/*',
    'pnpm-lock.yaml': '',
    'apps/a/package.json': '{}',
    'apps/b/package.json': '{}',
    'apps/b/deep/package.json': '{}',
    'apps/c/package.json': '{}',
  })

  const project = new Project(fs, cwd)
  await project.detectPackageManager()
  expect(project.packageManager).toMatchObject({ name: 'pnpm' })
  expect(await project.detectWorkspaces()).toMatchObject({
    isRoot: true,
    packages: [join(cwd, 'apps/a'), join(cwd, 'apps/b'), join(cwd, 'apps/c')],
  })
})
