import { join } from 'path'

import { beforeEach, expect, test, vi } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects build system in a monorepo setup', async ({ fs }) => {
  const cwd = mockFileSystem({
    'packages/website/package.json': JSON.stringify({ devDependencies: { turbo: '^1.6.3' } }),
    'packages/website/turbo.json': '',
    'packages/server/server.js': '',
  })

  const detected = await new Project(fs, join(cwd, 'packages/website')).detectBuildSystem()

  expect(detected[0].name).toBe('TurboRepo')
  expect(detected[0].version).toBe('^1.6.3')
})

test('detects multiple build systems in a monorepo setup', async ({ fs }) => {
  const cwd = mockFileSystem({
    'packages/website/package.json': JSON.stringify({ devDependencies: { lerna: '^2.5.3' } }),
    'packages/website/lerna.json': '',
    'packages/server/server.js': '',
    'build.gradle': '',
  })

  const detected = await new Project(fs, join(cwd, 'packages/website')).detectBuildSystem()
  expect(detected).toHaveLength(2)
  expect(detected).toMatchObject([
    {
      name: 'Gradle',
    },
    {
      name: 'Lerna',
      version: '^2.5.3',
    },
  ])
})

test('invalid package json handled gracefully', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': "{ 'devDependencies': { moon: '^0.5.1' } }",
    '.moon/toolchain.yml': '',
  })

  const logSpy = vi.fn()
  fs.logger = { error: logSpy, debug: vi.fn() } as any
  const detected = await new Project(fs, join(cwd, 'packages/website')).detectBuildSystem()
  expect(detected[0].name).toBe('MoonRepo')
  expect(detected[0].version).toBeUndefined()
  expect(logSpy).toHaveBeenCalled()
})
