import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects php when compose.json is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'compose.json': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('Php')
})
