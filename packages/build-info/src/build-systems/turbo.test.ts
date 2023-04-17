import { join } from 'path'

import { beforeEach, expect, test } from 'vitest'

import { createFixture } from '../../tests/helpers.js'
import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects turbo when turbo.json is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ devDependencies: { turbo: '^1.6.3' } }),
    'turbo.json': '',
  })
  const detected = await new Project(fs, cwd).detectBuildSystem()

  expect(detected[0]?.name).toBe('TurboRepo')
  expect(detected[0]?.version).toBe('^1.6.3')
})

test('retrieve TurboRepo settings', async (ctx) => {
  const fixture = await createFixture('turborepo')
  ctx.cleanup = fixture.cleanup
  const project = new Project(ctx.fs, fixture.cwd)
  const settings = await project.getBuildSettings()

  expect(settings).toEqual([
    expect.objectContaining({
      baseDirectory: join('apps/docs'),
      buildCommand: 'turbo run build --scope docs',
      devCommand: 'turbo run dev --scope docs',
      dist: join('apps/docs/.next'),
      frameworkPort: 3000, // TODO: use bash parser from ocean to identify args from commands to switch to 3001
    }),
    expect.objectContaining({
      baseDirectory: join('apps/web'),
      buildCommand: 'turbo run build --scope web',
      devCommand: 'turbo run dev --scope web',
      dist: join('apps/web/.next'),
      frameworkPort: 3000,
    }),
  ])
})

test('retrieve TurboRepo settings for a package folder', async (ctx) => {
  const fixture = await createFixture('turborepo')
  ctx.cleanup = fixture.cleanup
  const project = new Project(ctx.fs, join(fixture.cwd, 'apps/web'))
  const settings = await project.getBuildSettings()

  expect(settings).toEqual([
    expect.objectContaining({
      baseDirectory: join('apps/web'),
      buildCommand: 'turbo run build --scope web',
      devCommand: 'turbo run dev --scope web',
      dist: '.next',
      frameworkPort: 3000,
    }),
  ])
})
