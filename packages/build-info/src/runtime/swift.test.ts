import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects swift when .swift-version is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    '.swift-version': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('Swift')
})

test('detects swift when Package.swift is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'Package.swift': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('Swift')
})
