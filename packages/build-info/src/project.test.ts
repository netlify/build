import { join, resolve } from 'path'
import { cwd } from 'process'

import { coerce, parse } from 'semver'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { createFixture } from '../tests/helpers.js'
import { mockFileSystem } from '../tests/mock-file-system.js'

import { NodeFS } from './node/file-system.js'
import { Project } from './project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

afterEach(async ({ cleanup }) => await cleanup?.())

describe('Setting the node.js version', () => {
  test('should set the node version correctly by passing the process.version', async ({ fs }) => {
    const project = new Project(fs)
    expect(await project.getCurrentNodeVersion()).toBeNull()
    await project.setNodeVersion('v18.0.1')
    expect(await project.getCurrentNodeVersion()).toMatchObject({ major: 18, minor: 0, patch: 1 })
  })

  test('should set the node version correctly through an exact environment variable', async ({ fs }) => {
    const project = new Project(fs).setEnvironment({ NODE_VERSION: '18.1.2' })
    expect(await project.getCurrentNodeVersion()).toMatchObject({ major: 18, minor: 1, patch: 2 })
  })

  test('process node version should override environment variable', async ({ fs }) => {
    const project = new Project(fs).setNodeVersion(process.version).setEnvironment({ NODE_VERSION: '1.2.3' })
    expect(await project.getCurrentNodeVersion()).toMatchObject(parse(coerce(process.version)) || '')
  })

  test('should set the node version correctly through an fuzzy environment variable', async ({ fs }) => {
    const project = new Project(fs).setEnvironment({ NODE_VERSION: '18.x' })
    expect(await project.getCurrentNodeVersion()).toMatchObject({ major: 18, minor: 0, patch: 0 })
  })

  test('should set the node version correctly through a coerced environment variable', async ({ fs }) => {
    const project = new Project(fs).setEnvironment({ NODE_VERSION: '18' })
    const readFileSpy = vi.spyOn(fs, 'readFile')
    expect(await project.getCurrentNodeVersion()).toMatchObject({ major: 18, minor: 0, patch: 0 })
    expect(readFileSpy).not.toHaveBeenCalled()
  })

  test('should get the node version through the .node_version file', async ({ fs }) => {
    const cwd = mockFileSystem({ '.node_version': '18.x' })
    const readFileSpy = vi.spyOn(fs, 'readFile')
    const project = new Project(fs, cwd)
    expect(await project.getCurrentNodeVersion()).toMatchObject({ major: 18, minor: 0, patch: 0 })
    expect(readFileSpy).toHaveBeenCalledWith('.node_version')
  })

  test('should get the node version through the .nvmrc file', async ({ fs }) => {
    const cwd = mockFileSystem({ '.nvmrc': '16.x' })
    const readFileSpy = vi.spyOn(fs, 'readFile')
    const project = new Project(fs, cwd)
    expect(await project.getCurrentNodeVersion()).toMatchObject({ major: 16, minor: 0, patch: 0 })
    expect(readFileSpy).toHaveBeenCalledWith('.nvmrc')
  })

  test('should prefer the manual set node version over the file', async ({ fs }) => {
    const cwd = mockFileSystem({ '.nvmrc': '16.x' })
    const readFileSpy = vi.spyOn(fs, 'readFile')
    const project = new Project(fs, cwd).setNodeVersion('17.1.2')
    expect(await project.getCurrentNodeVersion()).toMatchObject({ major: 17, minor: 1, patch: 2 })
    expect(readFileSpy).not.toHaveBeenCalled()
  })
})

describe.concurrent('should resolve paths correctly', () => {
  test('if no options are provided root dir should be undefined and base directory should be the cwd', async ({
    fs,
  }) => {
    const project = new Project(fs)
    expect(project.baseDirectory).toBe(cwd())
    expect(project.root).toBeUndefined()
  })

  test('given a relative projectDir and a rootDir, resolve projectDir from rootDir', async ({ fs }) => {
    const project = new Project(fs, 'some/relative/path', '/root')
    expect(project.baseDirectory).toBe(resolve('/root', 'some/relative/path'))
    expect(project.relativeBaseDirectory).toBe('some/relative/path')
    expect(project.root).toBe(resolve('/root'))
    expect(await project.getRootPackageJSON()).toEqual({})
  })

  test('given an empty projectDir and a rootDir, resolve projectDir to rootDir', async ({ fs }) => {
    const project = new Project(fs, '', '/root')
    expect(project.baseDirectory).toBe(resolve('/root'))
    expect(project.relativeBaseDirectory).toBe('')
    expect(project.root).toBe(fs.cwd)
    expect(await project.getRootPackageJSON()).toEqual({})
  })

  test('given a relative rootDir resolve from cwd', async ({ fs }) => {
    const project = new Project(fs, 'some/relative/path', 'root')
    expect(project.baseDirectory).toBe(resolve(cwd(), 'root', 'some/relative/path'))
    expect(project.relativeBaseDirectory).toBe('some/relative/path')
    expect(project.root).toBe(resolve(cwd(), 'root'))
    expect(await project.getRootPackageJSON()).toEqual({})
  })

  test('given absolute dirs rely on them', async ({ fs }) => {
    const project = new Project(fs, '/root/dir/sub/project/dir', '/root/dir')
    expect(project.baseDirectory).toBe(resolve('/root/dir/sub/project/dir'))
    expect(project.relativeBaseDirectory).toBe(join('sub/project/dir'))
    expect(project.root).toBe(resolve('/root/dir'))
    expect(await project.getRootPackageJSON()).toEqual({})
  })
})

test('get the package.json from a simple project', async (ctx) => {
  const fixture = await createFixture('yarn-project', ctx)
  const project = new Project(ctx.fs, fixture.cwd)
  expect(project.relativeBaseDirectory).toBe('')
  const rootPackageJson = await project.getRootPackageJSON()
  expect(rootPackageJson.name).toBe('yarn-project')
})

test('get the package.json from a simple project without projectDir', async (ctx) => {
  const fixture = await createFixture('pnpm-simple', ctx)
  const project = new Project(ctx.fs, '', fixture.cwd)
  const rootPackageJson = await project.getRootPackageJSON()
  expect(rootPackageJson.name).toBe('pnpm-simple')
})

test('get the package.json from a nested project', async (ctx) => {
  const fixture = await createFixture('yarn-nested', ctx)
  const project = new Project(ctx.fs, 'projects/website', fixture.cwd)
  const rootPackageJson = await project.getRootPackageJSON()
  expect(rootPackageJson.name).toBe('yarn-nested')
})

test('work in non js workspaces as well', async (ctx) => {
  const fixture = await createFixture('go-workspace', ctx)
  const project = new Project(ctx.fs, 'foo', fixture.cwd)
  const rootPackageJson = await project.getRootPackageJSON()
  expect(rootPackageJson).toMatchInlineSnapshot('{}')
})

test('extract the rootPackageJson if there is one within rootDir', async (ctx) => {
  const fixture = await createFixture('js-workspaces', ctx)
  const project = new Project(ctx.fs, 'packages/package-2', fixture.cwd)
  const rootPackageJson = await project.getRootPackageJSON()
  expect(rootPackageJson.name).toBe('js-workspaces')
})

test('extract the rootPackageJson from projectDir if no rootDir is provided', async (ctx) => {
  const fixture = await createFixture('js-workspaces', ctx)
  const project = new Project(ctx.fs, join(fixture.cwd, 'packages/package-2'))
  const rootPackageJson = await project.getRootPackageJSON()
  expect(project.root).toBeUndefined()
  expect(rootPackageJson.name).toBe('js-workspaces')
})

describe('monorepo setup', () => {
  test('should prefer accuracy of config files over root node modules in a monorepo', async (ctx) => {
    const fixture = await createFixture('nx-integrated', ctx)
    const project = new Project(ctx.fs, fixture.cwd)
    await project.detectFrameworks()
    expect([...project.frameworks.keys()].sort()).toEqual([join('packages/astro'), join('packages/website')])
    expect(project.frameworks.get(join('packages/astro'))).toHaveLength(1)
    expect(project.frameworks.get(join('packages/astro'))).toEqual([
      expect.objectContaining({
        id: 'astro',
      }),
    ])
    expect(project.frameworks.get(join('packages/website'))).toHaveLength(1)
    expect(project.frameworks.get(join('packages/website'))).toEqual([
      expect.objectContaining({
        id: 'next',
      }),
    ])
  })

  test('should prefer accuracy of config files over root node modules in a monorepo from a base directory', async (ctx) => {
    const fixture = await createFixture('nx-integrated', ctx)
    const project = new Project(ctx.fs, join(fixture.cwd, 'packages/astro'))
    await project.detectFrameworks()

    expect([...project.frameworks.keys()].sort()).toEqual([join('packages/astro'), join('packages/website')])
    expect(project.frameworks.get(join('packages/astro'))).toHaveLength(1)
    expect(project.frameworks.get(join('packages/astro'))).toEqual([
      expect.objectContaining({
        id: 'astro',
      }),
    ])
  })
})

describe('event based detection', () => {
  test('should notify an event when finished with a step', async (ctx) => {
    const fixture = await createFixture('nx-integrated', ctx)
    const project = new Project(ctx.fs, join(fixture.cwd, 'packages/astro'))
    const eventSpy = vi.fn()
    const finished = new Promise<void>((resolve) => {
      project.events.on('detectPackageManager', (data) => {
        eventSpy('detectPackageManager', data)
      })
      project.events.on('detectBuildsystems', (data) => {
        eventSpy('detectBuildsystems', data)
      })
      project.events.on('detectWorkspaces', (data) => {
        eventSpy('detectWorkspaces', data)
      })
      project.events.on('detectFrameworks', (data) => {
        eventSpy('detectFrameworks', data)
      })
      project.events.on('detectSettings', (data) => {
        eventSpy('detectSettings', data)
        resolve()
      })
    })

    await project.getBuildSettings()
    expect(eventSpy).toBeCalledTimes(6)
    expect(eventSpy).toHaveBeenNthCalledWith(1, 'detectPackageManager', expect.objectContaining({ name: 'npm' }))
    // nx integrated is per se no npm or pnpm workspace
    expect(eventSpy).toHaveBeenNthCalledWith(2, 'detectWorkspaces', null)
    // this emission is triggered through the build system detection of Nx
    expect(eventSpy).toHaveBeenNthCalledWith(
      3,
      'detectWorkspaces',
      expect.objectContaining({
        isRoot: false,
        packages: [
          { path: join('packages/astro'), name: 'astro' },
          { path: join('packages/website'), name: 'website' },
        ],
      }),
    )
    expect(eventSpy).toHaveBeenNthCalledWith(4, 'detectBuildsystems', [expect.objectContaining({ id: 'nx' })])
    expect(eventSpy).toHaveBeenNthCalledWith(5, 'detectFrameworks', expect.objectContaining({}))
    expect(eventSpy).toHaveBeenNthCalledWith(6, 'detectSettings', [
      expect.objectContaining({
        baseDirectory: '', // nx should run from the root
        buildCommand: 'nx run astro:build',
        devCommand: 'nx run astro:dev',
      }),
    ])
    await finished
  })
})
