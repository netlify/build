import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects dotnet when Program.cs is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'Program.cs': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('Dotnet')
})

test('detects dotnet when appsettings.json is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'appsettings.json': '',
  })

  const detected = await new Project(fs, cwd).detectRuntime()
  expect(detected[0].name).toBe('Dotnet')
})
