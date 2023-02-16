import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

import { getWorkspacePackages } from './get-workspace-packages.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('should map explicit directories', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': '',
    'apps/a/package.json': '',
    'apps/b/package.json': '',
    'apps/b/deep/package.json': '',
    'apps/c/package.json': '',
  })

  expect(
    await getWorkspacePackages(new Project(fs, cwd), ['apps/a', 'apps/b', '!apps/c', 'not-existing/*']),
  ).toMatchObject(['apps/a', 'apps/b'])
})

test('should map a single star glob correctly', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': '',
    'apps/a/package.json': '',
    'apps/a/deep/package.json': '',
    'apps/other/deep/package.json': '',
    'apps/b/package.json': '',
    'apps/c/package.json': '',
  })
  expect(await getWorkspacePackages(new Project(fs, cwd), ['apps/*'])).toMatchObject(['apps/a', 'apps/b', 'apps/c'])
})

test('should match deep packages with a globstar expression', async ({ fs }) => {
  const cwd = mockFileSystem(
    {
      'package.json': '',
      'apps/other/hello.txt': '',
      'apps/deep/a/package.json': '',
      'apps/deep/b/package.json': '',
      'apps/deep/c/package.json': '',
      'apps/deep/d/no-package': '',
    },
    'test',
  )
  expect(await getWorkspacePackages(new Project(fs, cwd), ['apps/deep/**', '!apps/deep/a'])).toMatchObject([
    'apps/deep/b',
    'apps/deep/c',
  ])
})

test('should map the project paths correctly', async ({ fs }) => {
  const cwd = mockFileSystem(
    {
      'package.json': '',
      'packages/a/package.json': '',
      'packages/b/package.json': '',
      'apps/a/package.json': '',
      'apps/b/package.json': '',
      'apps/c/package.json': '',
      'apps/deep/d/package.json': '',
      'apps/deep/deeper/e/package.json': '',
      'apps/deep/deeper/f/package.json': '',
      'tools/package.json': '',
      'other/ignore': '',
    },
    'test',
  )

  expect(
    await getWorkspacePackages(new Project(fs, cwd), ['tools', 'packages/*', '!packages/b', 'apps/**', '!apps/b']),
  ).toMatchObject([
    'tools',
    'packages/a',
    'apps/a',
    'apps/c',
    'apps/deep/d',
    'apps/deep/deeper/e',
    'apps/deep/deeper/f',
  ])
})
