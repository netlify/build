import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects python when requirements.txt is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'requirements.txt': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('Python')
})

test('detects python when Pipfile is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    Pipfile: '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('Python')
})
