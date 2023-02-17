import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detects nx when nx.json is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ devDependencies: { nx: '^14.7.13' } }),
    'nx.json': '',
  })

  const detected = await new Project(fs, cwd).detectBuildSystem()

  expect(detected[0]?.name).toBe('Nx')
  expect(detected[0]?.version).toBe('^14.7.13')
})

test('detects lerna when lerna.json is present', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ devDependencies: { lerna: '^5.5.2' } }),
    'lerna.json': '',
  })

  const detected = await new Project(fs, cwd).detectBuildSystem()

  expect(detected[0]?.name).toBe('Lerna')
  expect(detected[0]?.version).toBe('^5.5.2')
})
