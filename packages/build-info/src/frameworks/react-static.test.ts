import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

let fs: NodeFS

beforeEach(() => {
  fs = new NodeFS()
})

test.each([
  ['dependency', { 'package.json': JSON.stringify({ dependencies: { 'react-static': '*' } }) }],
  ['config file static.config.js', { 'static.config.js': '' }],
])('should detect React Static via the %s', async (_, files) => {
  const cwd = mockFileSystem(files)
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('react-static')
  expect(detected?.[0].name).toBe('React Static')
  expect(detected?.[0].build.command).toBe('react-static build')
  expect(detected?.[0].build.directory).toBe('dist')
  expect(detected?.[0].dev?.command).toBe('react-static start')
  expect(detected?.[0].dev?.port).toBe(3000)
})
