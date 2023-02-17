import { join } from 'path'

import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects bazel when .bazelrc is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    '.bazelrc': '',
  })
  const detected = await new Project(fs, cwd).detectBuildSystem()

  expect(detected[0]?.name).toBe('Bazel')
})

test('detects bazel when BUILD.bazel is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'BUILD.bazel': '',
  })
  const detected = await new Project(fs, cwd).detectBuildSystem()
  expect(detected[0]?.name).toBe('Bazel')
})

test('detects bazel when BUILD.bazel is nested', async ({ fs }) => {
  const cwd = mockFileSystem({
    'BUILD.bazel': '',
    'other/test': '',
  })
  const detected = await new Project(fs, join(cwd, 'other'), cwd).detectBuildSystem()

  expect(detected[0]?.name).toBe('Bazel')
})

test('detects bazel when WORKSPACE is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    WORKSPACE: '',
  })
  const detected = await new Project(fs, cwd).detectBuildSystem()

  expect(detected[0]?.name).toBe('Bazel')
})
