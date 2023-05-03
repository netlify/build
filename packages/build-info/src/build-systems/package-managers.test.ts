import { join } from 'path'

import { beforeEach, describe, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

describe('PNPM workspaces', () => {
  test('Use pnpm scripts to run scripts in workspace mode', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': '{}',
      'pnpm-workspace.yaml': `packages:\n- apps/*`,
      'pnpm-lock.yaml': '',
      'apps/next/package.json': JSON.stringify({
        name: 'next-app',
        scripts: { build: 'astro build', dev: 'astro dev' },
        devDependencies: { next: '*' },
      }),
      'apps/astro/package.json': JSON.stringify({
        name: 'astro-app',
        scripts: { build: 'astro build', dev: 'astro dev' },
        devDependencies: { astro: '*' },
      }),
    })
    fs.cwd = cwd
    const project = new Project(fs, cwd)
    const settings = await project.getBuildSettings()
    expect(settings).toEqual([
      expect.objectContaining({
        baseDirectory: '', // executed from root
        buildCommand: 'pnpm run build --filter astro-app',
        devCommand: 'pnpm run dev --filter astro-app',
        dist: join('apps/astro/public'),
      }),
      expect.objectContaining({
        baseDirectory: '', // executed from root
        buildCommand: 'pnpm run build --filter next-app',
        devCommand: 'pnpm run dev --filter next-app',
        dist: join('apps/next/.next'),
      }),
    ])
  })
})

describe('NPM workspaces', () => {
  test('Use npm scripts to run scripts in workspace mode', async ({ fs }) => {
    const cwd = mockFileSystem({
      'package.json': JSON.stringify({
        workspaces: ['apps/*'],
      }),
      'apps/next/package.json': JSON.stringify({
        name: 'next-app',
        scripts: { build: 'astro build', dev: 'astro dev' },
        devDependencies: { next: '*' },
      }),
      'apps/astro/package.json': JSON.stringify({
        name: 'astro-app',
        scripts: { build: 'astro build', dev: 'astro dev' },
        devDependencies: { astro: '*' },
      }),
    })
    fs.cwd = cwd
    const project = new Project(fs, cwd)
    const settings = await project.getBuildSettings()
    expect(settings).toEqual([
      expect.objectContaining({
        baseDirectory: '', // executed from root
        buildCommand: 'npm run build --workspace astro-app',
        devCommand: 'npm run dev --workspace astro-app',
        dist: join('apps/astro/public'),
      }),
      expect.objectContaining({
        baseDirectory: '', // executed from root
        buildCommand: 'npm run build --workspace next-app',
        devCommand: 'npm run dev --workspace next-app',
        dist: join('apps/next/.next'),
      }),
    ])
  })
})
