import { join } from 'path'

import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { NoopLogger } from '../node/get-build-info.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
  ctx.fs.logger = new NoopLogger()
})

test('detects nx when nx.json is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ devDependencies: { nx: '^14.7.13' } }),
    'nx.json': '',
  })

  const project = new Project(fs, join(cwd, 'frontend'), cwd)
  const detected = await project.detectBuildSystem()

  expect(detected[0]?.name).toBe('Nx')
  expect(detected[0]?.version).toBe('^14.7.13')
  expect(project.workspace).toBeNull()
})

test('detects lerna when lerna.json is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ devDependencies: { lerna: '^5.5.2' } }),
    'lerna.json': '',
  })

  const detected = await new Project(fs, cwd).detectBuildSystem()

  expect(detected[0]?.name).toBe('Lerna')
  expect(detected[0]?.version).toBe('^5.5.2')
})

test('detects nx workspace packages in a nested folder structure', async ({ fs }) => {
  const cwd = mockFileSystem({
    'backend/go.mod': '',
    'backend/main.go': '',
    'frontend/package.json': JSON.stringify({ devDependencies: { nx: '^15.0.2' } }),
    'frontend/nx.json': JSON.stringify({
      workspaceLayout: { appsDir: 'packages', libsDir: 'packages' },
      defaultProject: 'website',
    }),
    'frontend/packages/website/project.json': JSON.stringify({
      name: 'website',
      sourceRoot: 'packages/website',
      projectType: 'application',
      tags: [],
    }),
    'frontend/packages/website/next.config.js': '',
    'frontend/packages/components/project.json': JSON.stringify({
      name: 'components',
      sourceRoot: 'packages/components/src',
      projectType: 'library',
      tags: [],
    }),
  })

  const project = new Project(fs, join(cwd, 'frontend'), cwd)
  const detected = await project.detectBuildSystem()

  expect(detected[0]?.name).toBe('Nx')
  expect(project.workspace).toMatchObject({
    isRoot: true,
    packages: ['packages/website'],
    rootDir: join(cwd, 'frontend'),
  })
})
