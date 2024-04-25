import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('should detect Blitz', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { blitz: '*' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('blitz')
  expect(detected?.[0].name).toBe('Blitz.js')
  expect(detected?.[0].build.command).toBe('blitz build')
  expect(detected?.[0].build.directory).toBe('out')
  expect(detected?.[0].dev?.command).toBe('blitz dev')
  expect(detected?.[0].dev?.port).toBe(3000)
})
