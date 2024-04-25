import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects ruby when .node-version is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    '.ruby-version': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('Ruby')
})

test('detects ruby when Gemfile.lock is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'Gemfile.lock': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('Ruby')
})

test('detects ruby when Gemfile is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    Gemfile: '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('Ruby')
})
