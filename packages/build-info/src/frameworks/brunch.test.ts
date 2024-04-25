import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

let fs: NodeFS

beforeEach(() => {
  fs = new NodeFS()
})

test.each([
  ['dependency', { 'package.json': JSON.stringify({ dependencies: { brunch: '*' } }) }],
  ['config file', { 'brunch-config.js': '' }],
])('should detect Brunch via the %s', async (_, files) => {
  const cwd = mockFileSystem(files)
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('brunch')
  expect(detected?.[0].name).toBe('Brunch')
  expect(detected?.[0].build.command).toBe('brunch build')
  expect(detected?.[0].build.directory).toBe('public')
  expect(detected?.[0].dev?.command).toBe('brunch watch --server')
  expect(detected?.[0].dev?.port).toBe(3333)
})
