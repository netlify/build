import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects java when project.clj  is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'project.clj': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('Java')
})

test('detects Java when build.boot is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'build.boot': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('Java')
})
