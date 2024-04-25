import { join } from 'path'

import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test.concurrent('detects nix when .nix files are present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'default.nix': '',
    'other/shell.nix': '',
  })
  const detected = await new Project(fs, cwd).detectBuildSystem()

  expect(detected[0]?.name).toBe('Nix')
})

test.concurrent('detects nix when .nix files are nested', async ({ fs }) => {
  const cwd = mockFileSystem({
    'default.nix': '',
    'other/shell.nix': '',
  })
  const detected = await new Project(fs, join(cwd, 'other')).detectBuildSystem()

  expect(detected[0]?.name).toBe('Nix')
})
