import { join } from 'path'

import { beforeEach, expect, test } from 'vitest'

import { createFixture } from '../../tests/helpers.js'
import { mockFileSystem } from '../../tests/mock-file-system.js'
import { Bazel } from '../build-systems/bazel.js'
import { NodeFS } from '../node/file-system.js'
import { NoopLogger } from '../node/get-build-info.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
  ctx.fs.logger = new NoopLogger()
})

test('get the settings for a next project', async (ctx) => {
  const fixture = await createFixture('next-project', ctx)
  const project = new Project(ctx.fs, fixture.cwd)
  const settings = await project.getBuildSettings()

  expect(settings).toEqual([
    expect.objectContaining({
      buildCommand: 'next build',
      devCommand: 'next',
      dist: '.next',
      env: {},
      frameworkPort: 3000,
      plugins: [],
      pollingStrategies: ['TCP'],
    }),
  ])
})

test('get the settings for a next project if a build system has no commands and overrides', async (ctx) => {
  const fixture = await createFixture('next-project', ctx)
  const project = new Project(ctx.fs, fixture.cwd)
  project.buildSystems = [new Bazel(project)]
  const settings = await project.getBuildSettings()

  expect(settings).toEqual([
    expect.objectContaining({
      buildCommand: 'next build',
      devCommand: 'next',
      dist: '.next',
      env: {},
      frameworkPort: 3000,
      plugins: [],
      pollingStrategies: ['TCP'],
    }),
  ])
})

test('retrieve Nx specific dist and commands for a framework', async (ctx) => {
  const fixture = await createFixture('nx-integrated', ctx)
  const project = new Project(ctx.fs, fixture.cwd)
  const settings = await project.getBuildSettings()

  expect(settings).toEqual([
    expect.objectContaining({
      baseDirectory: '', // nx needs to be run from the root
      buildCommand: 'nx run website:build',
      devCommand: 'nx run website:serve',
      dist: join('dist/packages/website/.next'),
      frameworkPort: 3000,
    }),
    expect.objectContaining({
      baseDirectory: '', // nx needs to be run from the root
      buildCommand: 'nx run astro:build',
      devCommand: 'nx run astro:dev',
      dist: join('dist/packages/astro/public'),
      frameworkPort: 3000,
    }),
  ])
})

test('get dev command from npm scripts if defined', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      scripts: { 'site:build': 'rollup -c', 'site:start': 'sirv public', 'site:dev': 'rollup -c -w' },
      devDependencies: { svelte: '^3.0.0' },
    }),
  })
  fs.cwd = cwd
  const project = new Project(fs, cwd)
  const settings = await project.getBuildSettings()
  expect(settings).toEqual([
    expect.objectContaining({
      devCommand: 'npm run site:dev',
    }),
  ])
})

test('get dev command from npm scripts if defined', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({
      workspaces: ['apps/*'],
    }),
    'apps/next/package.json': JSON.stringify({
      name: 'next-app',
      devDependencies: { next: '*' },
    }),
    'apps/svelte/package.json': JSON.stringify({
      name: 'svelte-app',
      scripts: { 'site:build': 'rollup -c', 'site:start': 'sirv public', 'site:dev': 'rollup -c -w' },
      devDependencies: { svelte: '^3.0.0' },
    }),
  })
  fs.cwd = cwd
  const project = new Project(fs, cwd)
  const settings = await project.getBuildSettings()
  expect(settings).toEqual([
    expect.objectContaining({
      baseDirectory: '', // executed via npm run so no base directory needed we can run from the root
      buildCommand: 'npm run site:build --workspace svelte-app',
      devCommand: 'npm run site:start --workspace svelte-app',
      dist: 'apps/svelte/static',
    }),
    expect.objectContaining({
      baseDirectory: 'apps/next', // not executed via npm run so we need to have a base directory
      buildCommand: 'next build',
      devCommand: 'next',
      dist: 'apps/next/.next',
    }),
  ])
})
