import { join } from 'path'

import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

import { detectWorkspaces } from './detect-workspace.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('workspace detection should throw if no package manager was detected previously', async ({ fs }) => {
  const cwd = mockFileSystem({})
  const project = new Project(fs, cwd)

  await expect(async () => await detectWorkspaces(project)).rejects.toThrowError()
})

test('should detect workspace packages correctly for an npm workspace', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      workspaces: ['apps/*'],
    }),
    'apps/a/package.json': '{}',
    'apps/b/package.json': '{}',
    'apps/b/deep/package.json': '{}',
    'apps/c/package.json': '{}',
  })

  const project = new Project(fs, cwd)
  expect(await project.detectWorkspaces()).toMatchObject({
    isRoot: true,
    packages: [
      { path: join('apps/a'), name: undefined },
      { path: join('apps/b'), name: undefined },
      { path: join('apps/c'), name: undefined },
    ],
  })
  expect(project.packageManager).toMatchObject({ name: 'npm' })
})

test('should detect a workspace from within a workspace package', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      workspaces: ['apps/**', '!apps/b/deep'],
    }),
    'apps/a/package.json': '{}',
    'apps/b/package.json': '{}',
    'apps/b/deep/package.json': '{}',
    'apps/c/package.json': '{}',
  })

  const project = new Project(fs, join(cwd, 'apps/a'))

  expect(await project.detectWorkspaces()).toEqual({
    isRoot: false,
    packages: [
      { path: join('apps/a'), name: undefined },
      { path: join('apps/b'), name: undefined },
      { path: join('apps/c'), name: undefined },
    ],
    rootDir: cwd,
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
  // not run at this point
  expect(project.packageManager).toBeUndefined()
  expect(await project.detectWorkspaces()).toBeNull()
  expect(project.packageManager).toMatchObject({ name: 'npm' })
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
  expect(await project.detectWorkspaces()).toMatchObject({
    isRoot: false,
    packages: [
      { path: join('apps/a'), name: undefined },
      { path: join('apps/b'), name: undefined },
      { path: join('apps/c'), name: undefined },
    ],
  })
  expect(project.packageManager).toMatchObject({ name: 'npm' })
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
  expect(await project.detectWorkspaces()).toBeNull()
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
  expect(await project.detectWorkspaces()).toMatchObject({
    isRoot: false,
    packages: [
      { path: join('apps/a'), name: undefined },
      { path: join('apps/b'), name: undefined },
      { path: join('apps/c'), name: undefined },
    ],
  })
  expect(project.packageManager).toMatchObject({ name: 'pnpm' })
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
  expect(await project.detectWorkspaces()).toMatchObject({
    isRoot: true,
    packages: [
      { path: join('apps/a'), name: undefined },
      { path: join('apps/b'), name: undefined },
      { path: join('apps/c'), name: undefined },
    ],
  })
  expect(project.packageManager).toMatchObject({ name: 'pnpm' })
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
  expect(project.workspace).toBeUndefined()
  await project.detectWorkspaces()
  expect(project.packageManager).toMatchObject({ name: 'pnpm' })
  expect(project.workspace).toBeNull()
})
