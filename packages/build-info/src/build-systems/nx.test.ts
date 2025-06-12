import { join } from 'path'

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { createFixture } from '../../tests/helpers.js'
import { mockFileSystem } from '../../tests/mock-file-system.js'
import * as metrics from '../metrics.js'
import { NodeFS } from '../node/file-system.js'
import { NoopLogger } from '../node/get-build-info.js'
import { Project } from '../project.js'

import { Nx } from './nx.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
  ctx.fs.logger = new NoopLogger()
  vi.spyOn(metrics, 'report').mockImplementation(() => {
    // noop
  })
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

  expect(await nx.getCommands?.(join('packages/astro'))).toEqual([
    { command: 'nx run astro:build', type: 'build' },
    { command: 'nx run astro:dev', type: 'dev' },
    { command: 'nx run astro:preview', type: 'unknown' },
    { command: 'nx run astro:check', type: 'unknown' },
    { command: 'nx run astro:sync', type: 'unknown' },
  ])
  expect(await nx.getCommands?.(join('packages/website'))).toEqual([
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

test('detects nx workspace packages in the default locations', async ({ fs }) => {
  const cwd = mockFileSystem({
    'nx.json': '{}', // no workspaceLayout specified
    'package.json': JSON.stringify({ devDependencies: { nx: '^15.0.2' } }),
    'packages/app-1/project.json': JSON.stringify({
      name: 'app-1',
      sourceRoot: 'packages/app-1',
      projectType: 'application',
      tags: [],
      targets: { build: { executor: '@nrwl/next:build' } },
    }),
    'apps/app-2/project.json': JSON.stringify({
      name: 'app-2',
      sourceRoot: 'apps/app-2',
      projectType: 'application',
      tags: [],
      targets: { build: { executor: '@nrwl/next:build' } },
    }),
  })
  fs.cwd = cwd
  const project = new Project(fs, cwd, cwd)
  await project.getBuildSettings()
  expect(project.buildSystems).toHaveLength(1)
  expect(project.buildSystems[0]?.id).toBe('nx')
  expect(project.workspace).toMatchObject({
    isRoot: true,
    packages: [
      { path: join('apps/app-2'), name: 'app-2', forcedFramework: 'next' },
      { path: join('packages/app-1'), name: 'app-1', forcedFramework: 'next' },
    ],
    rootDir: cwd,
  })
})

describe('getDist', () => {
  beforeEach((ctx) => {
    ctx.cwd = mockFileSystem({
      'nx.json': '{"workspaceLayout":{"appsDir":"packages"}}',
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
    expect(await nx.getDist(join('packages/vue-app'))).toBe(null)
  })
  test('retrieve publish directory from nested options for integrated setup', async ({ fs, cwd }) => {
    const project = new Project(fs, cwd)
    project.jsWorkspaceRoot = cwd
    const nx = await new Nx(project).detect()
    expect(await nx?.getDist(join('packages/vue-app'))).toBe(join('dist/packages/vue-app-from-option'))
  })

  test('retrieve the package path as fallback', async ({ fs }) => {
    const cwd = mockFileSystem({
      'nx.json': '{"workspaceLayout":{"appsDir":"packages"}}',
      'packages/vue-app/project.json': JSON.stringify({
        name: 'vue-app',
        projectType: 'application',
        targets: {
          build: {},
        },
      }),
    })
    const project = new Project(fs, cwd)
    project.jsWorkspaceRoot = cwd
    const nx = await new Nx(project).detect()
    expect(await nx?.getDist(join('packages/vue-app'))).toBe(join('dist/packages/vue-app'))
  })
})

describe('nx-integrated project.json based', () => {
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
          dist: join('dist/packages/website/.next'),
          framework: { id: 'next', name: 'Next.js' },
          frameworkPort: 4200,
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
          frameworkPort: 3000,
          name: `Nx + Astro ${join('packages/astro')}`,
          packagePath: join('packages/astro'),
          plugins_recommended: [],
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
        dist: join('dist/packages/website/.next'),
      }),
    ])
  })
})

describe('nx-integrated workspace.json based', () => {
  test('detect build settings from the repo root', async (ctx) => {
    const fixture = await createFixture('nx-integrated-old', ctx)
    const project = new Project(ctx.fs, fixture.cwd).setEnvironment({ NODE_VERSION: '20' })
    const settings = await project.getBuildSettings()

    expect(settings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          baseDirectory: '',
          buildCommand: 'nx run website:build',
          devCommand: 'nx run website:serve',
          dist: join('dist/apps/website/output-folder'),
          framework: { id: 'react-static', name: 'React Static' },
          frameworkPort: 4200,
          name: `Nx + React Static ${join('apps/website')}`,
          packagePath: join('apps/website'),
          plugins_recommended: [],
        }),
      ]),
    )
    expect(settings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          baseDirectory: '',
          buildCommand: 'nx run astro:build',
          devCommand: 'nx run astro:dev',
          dist: join('dist/apps/astro'),
          framework: { id: 'astro', name: 'Astro' },
          name: `Nx + Astro ${join('apps/astro')}`,
          packagePath: join('apps/astro'),
          plugins_recommended: [],
        }),
      ]),
    )
  })

  test('detect build settings from a package sub path', async (ctx) => {
    const fixture = await createFixture('nx-integrated-old', ctx)
    const project = new Project(ctx.fs, join(fixture.cwd, 'apps/website'))
    const settings = await project.getBuildSettings()

    expect(settings).toEqual([
      expect.objectContaining({
        baseDirectory: '',
        buildCommand: 'nx run website:build',
        devCommand: 'nx run website:serve',
        dist: join('dist/apps/website/output-folder'),
      }),
    ])
  })
})
