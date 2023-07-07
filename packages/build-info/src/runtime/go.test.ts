import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects go when .go-version is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    '.go-version': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('Go')
})

test('detects go when go.mod is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'go.mod': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('Go')
})

test('detects go when go.work is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'go.work': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('Go')
})
