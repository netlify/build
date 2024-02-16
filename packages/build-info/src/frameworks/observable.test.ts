import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

beforeEach((ctx) => {
  ctx.fs = new NodeFS()
})

test('detect an Observable project', async ({ fs }) => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { '@observablehq/framework': 'latest' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('observable')
  expect(detected?.[0].name).toBe('Observable Framework')
  expect(detected?.[0].build?.command).toBe('observable build')
  expect(detected?.[0].dev?.command).toBe('observable preview')
})
