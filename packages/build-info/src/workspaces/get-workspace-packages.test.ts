import { join } from 'path'

import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

import { getWorkspacePackages } from './get-workspace-packages.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('should return an empty array if no patterns are provided', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': '{}',
  })
  const packages = await getWorkspacePackages(new Project(fs, cwd), undefined)
  expect(packages).toHaveLength(0)
  expect(packages).toEqual([])
})

test('should map explicit directories', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': '{}',
    'apps/a/package.json': JSON.stringify({ name: 'a' }),
    'apps/b/package.json': JSON.stringify({ name: 'b' }),
    'apps/b/deep/package.json': '{}',
    'apps/c/package.json': '{}',
  })

  expect(
    await getWorkspacePackages(new Project(fs, cwd), ['apps/a', 'apps/b', '!apps/c', 'not-existing/*']),
  ).toMatchObject([
    { path: 'apps/a', name: 'a' },
    { path: 'apps/b', name: 'b' },
  ])
})

test('should map a single star glob correctly', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': '{}',
    'apps/a/package.json': JSON.stringify({ name: 'a' }),
    'apps/a/deep/package.json': '{}',
    'apps/other/deep/package.json': '{}',
    'apps/b/package.json': JSON.stringify({ name: 'b' }),
    'apps/c/package.json': JSON.stringify({ name: 'c' }),
  })
  expect(await getWorkspacePackages(new Project(fs, cwd), ['apps/*'])).toMatchObject([
    { path: join('apps/a'), name: 'a' },
    { path: join('apps/b'), name: 'b' },
    { path: join('apps/c'), name: 'c' },
  ])
})

test('should match deep packages with a globstar expression', async ({ fs }) => {
  const cwd = mockFileSystem(
    {
      'package.json': '{}',
      'apps/other/hello.txt': '',
      'apps/deep/a/package.json': '{}',
      'apps/deep/b/package.json': JSON.stringify({ name: 'b' }),
      'apps/deep/c/package.json': JSON.stringify({ name: 'c' }),
      'apps/deep/d/no-package': '{}',
    },
    'test',
  )
  expect(await getWorkspacePackages(new Project(fs, cwd), ['apps/deep/**', '!apps/deep/a'])).toMatchObject([
    { path: join('apps/deep/b'), name: 'b' },
    { path: join('apps/deep/c'), name: 'c' },
  ])
})

test('should map the project paths correctly', async ({ fs }) => {
  const cwd = mockFileSystem(
    {
      'package.json': '{}',
      'packages/a/package.json': '{}',
      'packages/b/package.json': '{}',
      'apps/a/package.json': '{}',
      'apps/b/package.json': '{}',
      'apps/c/package.json': '{}',
      'apps/deep/d/package.json': '{}',
      'apps/deep/deeper/e/package.json': '{}',
      'apps/deep/deeper/f/package.json': '{}',
      'tools/package.json': '{}',
      'other/ignore': '',
    },
    'test',
  )

  expect(
    await getWorkspacePackages(new Project(fs, cwd), ['tools', 'packages/*', '!packages/b', 'apps/**', '!apps/b']),
  ).toMatchObject([
    { path: join('tools'), name: undefined },
    { path: join('packages/a'), name: undefined },
    { path: join('apps/a'), name: undefined },
    { path: join('apps/c'), name: undefined },
    { path: join('apps/deep/d'), name: undefined },
    { path: join('apps/deep/deeper/e'), name: undefined },
    { path: join('apps/deep/deeper/f'), name: undefined },
  ])
})
