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
        buildCommand: 'pnpm --filter astro-app run build',
        devCommand: 'pnpm --filter astro-app run dev',
        dist: join('apps/astro/dist'),
      }),
      expect.objectContaining({
        baseDirectory: '', // executed from root
        buildCommand: 'pnpm --filter next-app run build',
        devCommand: 'pnpm --filter next-app run dev',
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
        buildCommand: 'npm --workspace astro-app run build',
        devCommand: 'npm --workspace astro-app run dev',
        dist: join('apps/astro/dist'),
      }),
      expect.objectContaining({
        baseDirectory: '', // executed from root
        buildCommand: 'npm --workspace next-app run build',
        devCommand: 'npm --workspace next-app run dev',
        dist: join('apps/next/.next'),
      }),
    ])
  })
})
