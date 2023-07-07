import { afterEach, beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { NoopLogger } from '../node/get-build-info.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
  ctx.fs.logger = new NoopLogger()
})

afterEach(async ({ cleanup }) => await cleanup?.())

test('detects lerna when lerna.json is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ devDependencies: { lerna: '^5.5.2' } }),
    'lerna.json': '',
  })
  fs.cwd = cwd

  const detected = await new Project(fs, cwd).detectBuildSystem()

  expect(detected[0]?.name).toBe('Lerna')
  expect(detected[0]?.version).toBe('^5.5.2')
})
