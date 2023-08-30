import { beforeEach, expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { NodeFS } from '../node/file-system.js'
import { Project } from '../project.js'

let fs: NodeFS

beforeEach(() => {
  fs = new NodeFS()
})

test.each([
  ['dependency', { 'package.json': JSON.stringify({ dependencies: { astro: '*' } }) }],
  ['config file', { 'astro.config.mjs': '' }],
])('should detect Astro via the %s', async (_, files) => {
  const cwd = mockFileSystem(files)
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('astro')
  expect(detected?.[0].name).toBe('Astro')
  expect(detected?.[0].build.command).toBe('astro build')
  expect(detected?.[0].build.directory).toBe('dist')
  expect(detected?.[0].dev?.command).toBe('astro dev')
  expect(detected?.[0].dev?.port).toBe(4321)
})

test('should return 3000 for less than 3.0.0', async () => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { astro: '2.0.0' } }),
  })

  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('astro')
  expect(detected?.[0].name).toBe('Astro')
  expect(detected?.[0].build.command).toBe('astro build')
  expect(detected?.[0].build.directory).toBe('dist')
  expect(detected?.[0].dev?.command).toBe('astro dev')
  expect(detected?.[0].dev?.port).toBe(3000)
})

test('should detect Astro 3.0.0+ via the dependency', async () => {
  const cwd = mockFileSystem({
    'package.json': JSON.stringify({ dependencies: { astro: '3.0.0' } }),
  })
  const detected = await new Project(fs, cwd).detectFrameworks()
  expect(detected?.[0].id).toBe('astro')
  expect(detected?.[0].name).toBe('Astro')
  expect(detected?.[0].build.command).toBe('astro build')
  expect(detected?.[0].build.directory).toBe('dist')
  expect(detected?.[0].dev?.command).toBe('astro dev')
  expect(detected?.[0].dev?.port).toBe(4321)
})
