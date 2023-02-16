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
    packages: [join('apps/a'), join('apps/b'), join('apps/c')],
  })
})

test('should not detect workspace from a nested ignored package', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      workspaces: ['apps/**', '!apps/b/deep'],
    }),
    'apps/a/package.json': '{}',
    'apps/b/package.json': '{}',
    'apps/b/deep/package.json': '{}',
    'apps/c/package.json': '{}',
  })

  const project = new Project(fs, 'apps/b/deep', cwd)
  await project.detectPackageManager()
  expect(project.packageManager).toMatchObject({ name: 'npm' })
  expect(await project.detectWorkspaces()).toBeUndefined()
})

test('should detect workspace packages correctly for an npm workspace from a nested directory', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      workspaces: ['apps/**', '!apps/b/deep'],
    }),
    'apps/a/package.json': '{}',
    'apps/b/package.json': '{}',
    'apps/b/deep/package.json': '{}',
    'apps/c/package.json': '{}',
  })

  const project = new Project(fs, 'apps/b', cwd)
  await project.detectPackageManager()
  expect(project.packageManager).toMatchObject({ name: 'npm' })
  expect(await project.detectWorkspaces()).toMatchObject({
    isRoot: false,
    packages: [join('apps/a'), join('apps/b'), join('apps/c')],
  })
})

test('should detect no workspace from a nested dir that is not part of the pattern', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': '{}',
    'pnpm-workspace.yaml': 'packages:\n - apps/*',
    'pnpm-lock.yaml': '',
    'apps/a/package.json': '{}',
    'apps/b/package.json': '{}',
    'apps/b/deep/package.json': '{}',
    'apps/c/package.json': '{}',
  })

  const project = new Project(fs, 'apps/b/deep', cwd)
  await project.detectPackageManager()
  expect(project.packageManager).toMatchObject({ name: 'pnpm' })
  expect(await project.detectWorkspaces()).toBeUndefined()
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

  const project = new Project(fs, 'apps/b', cwd)
  await project.detectPackageManager()
  expect(project.packageManager).toMatchObject({ name: 'pnpm' })
  expect(await project.detectWorkspaces()).toMatchObject({
    isRoot: false,
    packages: [join('apps/a'), join('apps/b'), join('apps/c')],
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
    packages: [join('apps/a'), join('apps/b'), join('apps/c')],
  })
})

test('should ignore workspaces if project is not part of a workspace', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': '{}',
    'pnpm-workspace.yaml': 'packages:\n - apps/*',
    'pnpm-lock.yaml': '',
    'apps/a/package.json': '{}',
    'apps/b/package.json': '{}',
    'apps/b/deep/package.json': '{}',
    'apps/c/package.json': '{}',
    'tools/package.json': '{}',
  })

  const project = new Project(fs, join(cwd, 'tools'), cwd)
  await project.detectPackageManager()
  expect(project.packageManager).toMatchObject({ name: 'pnpm' })
  expect(await project.detectWorkspaces()).toBeUndefined()
})
