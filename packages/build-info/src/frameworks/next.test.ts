import { join } from 'path'

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { createFixture } from '../../tests/helpers.js'
import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { NoopLogger } from '../node/get-build-info.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
  ctx.fs.logger = new NoopLogger()
})

describe('Next.js Plugin', () => {
  beforeEach((ctx) => {
    ctx.cwd = mockFileSystem({
      'package.json': JSON.stringify({
        name: 'my-next-app',
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
        dependencies: {
          next: '10.0.5',
          react: '17.0.1',
          'react-dom': '17.0.1',
        },
      }),
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('Should detect Next.js plugin for Next.js if when Node version >= 10.13.0', async ({ fs, cwd }) => {
    const project = new Project(fs, cwd).setNodeVersion('v10.13.0')
    const frameworks = await project.detectFrameworks()
    expect(frameworks?.[0].id).toBe('next')
    expect(frameworks?.[0].plugins).toEqual(['@netlify/plugin-nextjs'])
  })

  test('Should not detect Next.js plugin for Next.js if when Node version < 10.13.0', async ({ fs, cwd }) => {
    const project = new Project(fs, cwd).setNodeVersion('v8.3.1')
    const frameworks = await project.detectFrameworks()
    expect(frameworks?.[0].id).toBe('next')
    expect(frameworks?.[0].plugins).toHaveLength(0)
  })

  test('Should not install plugin when NETLIFY_NEXT_PLUGIN_SKIP is set', async ({ fs, cwd }) => {
    const project = new Project(fs, cwd).setNodeVersion('v10.13.0')
    vi.stubEnv('NETLIFY_NEXT_PLUGIN_SKIP', 'true')
    const frameworks = await project.detectFrameworks()
    expect(frameworks?.[0].id).toBe('next')
    expect(frameworks?.[0].plugins).toHaveLength(0)
  })
})

describe('simple Next.js project', async () => {
  beforeEach((ctx) => {
    ctx.cwd = mockFileSystem({
      'package.json': JSON.stringify({
        name: 'my-next-app',
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
        dependencies: {
          next: '10.0.5',
          react: '17.0.1',
          'react-dom': '17.0.1',
        },
      }),
    })
  })

  test('should detect Next.js based on a simple package.json dependency', async ({ fs, cwd }) => {
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.[0].id).toBe('next')
  })

  test('Should not detect Next.js plugin for Next.js if no node version is defined', async ({ fs, cwd }) => {
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.[0].id).toBe('next')
    expect(detected?.[0].plugins).toHaveLength(0)
  })

  test('Should not detect Next.js plugin for Next.js if when Node version < 10.13.0', async ({ fs, cwd }) => {
    const detected = await new Project(fs, cwd).setNodeVersion('v8.3.0').detectFrameworks()
    expect(detected?.[0].id).toBe('next')
    expect(detected?.[0].plugins).toHaveLength(0)
  })

  test('Should detect Next.js plugin for Next.js if when Node version >= 10.13.0', async ({ fs, cwd }) => {
    const detected = await new Project(fs, cwd).setEnvironment({ NODE_VERSION: '18.x' }).detectFrameworks()
    expect(detected?.[0].id).toBe('next')
    expect(detected?.[0].plugins).toMatchObject(['@netlify/plugin-nextjs'])
  })
})

describe('Next.js Monorepo using PNPM', () => {
  beforeEach((ctx) => {
    ctx.cwd = mockFileSystem({
      'package.json': '{}',
      'pnpm-workspace.yaml': 'packages:\n - apps/*',
      'pnpm-lock.yaml': '',
      'apps/website/package.json': JSON.stringify({
        dependencies: {
          next: '10.0.5',
          react: '17.0.1',
          'react-dom': '17.0.1',
        },
      }),
    })
  })

  test('should detect Next.js from an base directory inside a monorepo', async ({ fs, cwd }) => {
    const detected = await new Project(fs, join(cwd, 'apps/website'), cwd).detectFrameworks()
    expect(detected?.[0].id).toBe('next')
  })

  test('should detect Next.js from the root of a monorepo', async ({ fs, cwd }) => {
    const detected = await new Project(fs, cwd).detectFrameworks()
    expect(detected?.[0].id).toBe('next')
  })
})

describe('Nx monorepo', () => {
  test('should get Next.js settings within a nx monorepo and the next.js plugin', async (ctx) => {
    const fixture = await createFixture('nx-integrated', ctx)
    const project = new Project(ctx.fs, fixture.cwd).setNodeVersion('v10.13.0')
    const settings = await project.getBuildSettings()

    const setting = settings.find((s) => s.packagePath === join('packages/website'))
    expect(setting).toMatchObject({
      packagePath: join('packages/website'),
      buildCommand: 'nx run website:build',
      devCommand: 'nx run website:serve',
      dist: join('dist/packages/website/.next'),
      frameworkPort: 4200,
      plugins_recommended: ['@netlify/plugin-nextjs'],
    })
  })
})

describe('Nx turborepo', () => {
  test('should get Next.js settings within turborepo and the next.js plugin', async (ctx) => {
    const fixture = await createFixture('turborepo', ctx)
    const project = new Project(ctx.fs, fixture.cwd).setNodeVersion('v10.13.0')
    const settings = await project.getBuildSettings()

    const setting = settings.find((s) => s.packagePath === join('apps/web'))
    expect(setting).toMatchObject({
      packagePath: join('apps/web'),
      buildCommand: 'turbo run build --filter web',
      devCommand: 'turbo run dev --filter web',
      dist: join('apps/web/.next'),
      frameworkPort: 3000,
      plugins_recommended: ['@netlify/plugin-nextjs'],
    })
  })
})
