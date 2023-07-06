import { join } from 'path'

import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { createFixture } from '../../tests/helpers.js'
import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { NoopLogger } from '../node/get-build-info.js'
import { Project } from '../project.js'

import { Nx } from './nx.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
  ctx.fs.logger = new NoopLogger()
})

afterEach(async ({ cleanup }) => await cleanup?.())

test('Get no commands for a non existing package', async (ctx) => {
  const fixture = await createFixture('nx-integrated', ctx)
  const project = new Project(ctx.fs, fixture.cwd)
  const [nx] = await project.detectBuildSystem()

  expect(await nx.getCommands?.('packages/astro-not-existing')).toEqual([])
})

test('Get the commands for a package', async (ctx) => {
  const fixture = await createFixture('nx-integrated', ctx)
  const project = new Project(ctx.fs, fixture.cwd)
  const [nx] = await project.detectBuildSystem()

  expect(await nx.getCommands?.('packages/astro')).toEqual([
    { command: 'nx run astro:build', type: 'build' },
    { command: 'nx run astro:dev', type: 'dev' },
    { command: 'nx run astro:preview', type: 'unknown' },
    { command: 'nx run astro:check', type: 'unknown' },
    { command: 'nx run astro:sync', type: 'unknown' },
  ])
  expect(await nx.getCommands?.('packages/website')).toEqual([
    { command: 'nx run website:build', type: 'build' },
    { command: 'nx run website:serve', type: 'dev' },
  ])
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
  fs.cwd = cwd
  const project = new Project(fs, join(cwd, 'frontend'), cwd)
  const detected = await project.detectBuildSystem()
  expect(detected).toHaveLength(1)
  expect(detected[0]?.id).toBe('nx')
  expect(project.workspace).toMatchObject({
    isRoot: true,
    packages: [{ path: join('packages/website'), name: 'website' }],
    rootDir: join(cwd, 'frontend'),
  })
})

describe('getDist', () => {
  beforeEach((ctx) => {
    ctx.cwd = mockFileSystem({
      'packages/vue-app/project.json': JSON.stringify({
        name: 'vue-app',
        projectType: 'application',
        sourceRoot: 'packages/vue-app/src',
        targets: {
          build: {
            executor: '@nx-plus/vue:browser',
            outputs: ['{options.dest}'],
            options: {
              dest: 'dist/packages/vue-app-from-option',
            },
          },
        },
      }),
    })
    ctx.fs.cwd = ctx.cwd
  })
  test('retrieve null for package based setups', async ({ fs, cwd }) => {
    const project = new Project(fs, cwd)
    const nx = new Nx(project)
    expect(await nx.getDist('packages/vue-app')).toBe(null)
  })
  test('retrieve publish directory from nested options for integrated setup', async ({ fs, cwd }) => {
    const project = new Project(fs, cwd)
    const nx = new Nx(project)
    nx.isIntegrated = true
    expect(await nx.getDist('packages/vue-app')).toBe(join('dist/packages/vue-app-from-option'))
  })

  test('retrieve the package path as fallback ', async ({ fs }) => {
    const cwd = mockFileSystem({
      'packages/vue-app/project.json': JSON.stringify({
        name: 'vue-app',
        projectType: 'application',
        targets: {
          build: {},
        },
      }),
    })
    const project = new Project(fs, cwd)
    const nx = new Nx(project)
    nx.isIntegrated = true
    expect(await nx.getDist('packages/vue-app')).toBe(join('dist/packages/vue-app'))
  })
})

describe('nx-integrated', () => {
  test('detect build settings from the repo root', async (ctx) => {
    const fixture = await createFixture('nx-integrated', ctx)
    const project = new Project(ctx.fs, fixture.cwd).setEnvironment({ NODE_VERSION: '20' })
    const settings = await project.getBuildSettings()
    expect(settings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          baseDirectory: '',
          buildCommand: 'nx run website:build',
          devCommand: 'nx run website:serve',
          dist: join('dist/packages/website'),
          framework: { id: 'next', name: 'Next.js' },
          name: `Nx + Next.js ${join('packages/website')}`,
          packagePath: join('packages/website'),
          plugins_recommended: ['@netlify/plugin-nextjs'],
        }),
      ]),
    )
    expect(settings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          baseDirectory: '',
          buildCommand: 'nx run astro:build',
          devCommand: 'nx run astro:dev',
          dist: join('dist/packages/astro'),
          framework: { id: 'astro', name: 'Astro' },
          name: `Nx + Astro ${join('packages/astro')}`,
          packagePath: join('packages/astro'),
        }),
      ]),
    )
  })
  test('detect build settings from a package sub path', async (ctx) => {
    const fixture = await createFixture('nx-integrated', ctx)
    const project = new Project(ctx.fs, join(fixture.cwd, 'packages/website'))
    const settings = await project.getBuildSettings()

    expect(settings).toEqual([
      expect.objectContaining({
        baseDirectory: '',
        buildCommand: 'nx run website:build',
        devCommand: 'nx run website:serve',
        dist: join('dist/packages/website'),
      }),
    ])
  })
})
