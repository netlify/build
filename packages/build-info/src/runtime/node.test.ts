import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects node when .node-version is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    '.node-version': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('NodeJS')
})

test('detects node when .nvmrc is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    '.nvmrc': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('NodeJS')
})

test('detects node when .package.json is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('NodeJS')
})
