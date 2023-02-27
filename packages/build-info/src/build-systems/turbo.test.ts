import { beforeEach, expect, test } from 'vitest'

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
