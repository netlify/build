import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('should detect Assemble via the dependency', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { assemble: '1.2.3' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('assemble')
  expect(detected?.[0].name).toBe('Assemble')
  expect(detected?.[0].build.command).toBe('grunt build')
  expect(detected?.[0].build.directory).toBe('dist')
  expect(detected?.[0].dev).toBeUndefined()
})
