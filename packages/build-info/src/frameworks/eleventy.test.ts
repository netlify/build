import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

let fs: NodeFS

beforeEach(() => {
  fs = new NodeFS()
})

test.each([
  ['dependency', { 'package.json': JSON.stringify({ dependencies: { '@11ty/eleventy': '*' } }) }],
  ['config file .eleventy.js', { '.eleventy.js': '' }],
  ['config file eleventy.config.js', { 'eleventy.config.js': '' }],
  ['config file eleventy.config.cjs', { 'eleventy.config.cjs': '' }],
])('should detect 11ty via the %s', async (_, files) => {
  const cwd = mockFileSystem(files)
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('eleventy')
  expect(detected?.[0].name).toBe('Eleventy')
  expect(detected?.[0].build.command).toBe('eleventy --config=.eleventy.js')
  expect(detected?.[0].build.directory).toBe('_site')
  expect(detected?.[0].dev?.command).toBe('eleventy --serve')
  expect(detected?.[0].dev?.port).toBe(8080)
})
