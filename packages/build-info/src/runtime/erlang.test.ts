import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects erlang when rebar.config is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'rebar.config': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected.length).toBe(1)
  expect(detected[0].name).toBe('Erlang')
})

test('detects erlang when rebar.lock is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'rebar.lock': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected.length).toBe(1)
  expect(detected[0].name).toBe('Erlang')
})
