import { join } from 'path'

import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { createFixture } from '../../tests/helpers.js'
import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { NoopLogger } from '../node/get-build-info.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
  ctx.fs.logger = new NoopLogger()
})

afterEach(async ({ cleanup }) => await cleanup?.())

describe('Nx', () => {
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

describe('Lerna', () => {
  test('detects lerna when lerna.json is present', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({ devDependencies: { lerna: '^5.5.2' } }),
      'lerna.json': '',
    })

    const detected = await new Project(fs, cwd).detectBuildSystem()

    expect(detected[0]?.name).toBe('Lerna')
    expect(detected[0]?.version).toBe('^5.5.2')
  })
})
