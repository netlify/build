import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects rust when Cargo.toml is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'Cargo.toml': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('Rust')
})

test('detects rust when Cargo.lock is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'Cargo.lock': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('Rust')
})
