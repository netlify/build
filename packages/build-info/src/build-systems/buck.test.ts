import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects buck when .buckconfig is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    '.buckconfig': '',
  })
  const detected = await new Project(fs, cwd).detectBuildSystem()

  expect(detected[0]?.name).toBe('Buck')
})
