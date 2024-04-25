import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects moonrepo when .moon directory is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ devDependencies: { moon: '^0.5.1' } }),
    '.moon/toolchain.yml': '',
  })
  const detected = await new Project(fs, cwd).detectBuildSystem()

  expect(detected[0]?.name).toBe('MoonRepo')
  expect(detected[0]?.version).toBe('^0.5.1')
})
